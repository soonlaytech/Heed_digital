import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    const replId = process.env.REPL_ID?.trim();
    if (!replId || replId === "dummy") {
      throw new Error("REPL_ID is not configured. Using local auth fallback.");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      replId
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const useLocalDevAuth = process.env.NODE_ENV !== "production" && (!process.env.REPL_ID || process.env.REPL_ID === "dummy");
  const useLocalProdAuth = process.env.NODE_ENV === "production" && (!process.env.REPL_ID || process.env.REPL_ID === "dummy");

  let config: any = null;

  // Only try to get OIDC config if REPL_ID is valid
  if (!useLocalDevAuth && !useLocalProdAuth) {
    try {
      config = await getOidcConfig();
    } catch (err) {
      console.warn("Failed to initialize OIDC. Using local auth fallback.", err);
    }
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName) && config) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    if (useLocalDevAuth || useLocalProdAuth || !config) {
      return res.redirect("/api/local-login");
    }

    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/local-login", async (req, res, next) => {
    try {
      const localUser = {
        claims: {
          sub: "local-user",
          email: "local@localhost",
          first_name: "Local",
          last_name: "User",
          profile_image_url: "",
        },
        access_token: "local-token",
        refresh_token: "",
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      };

      await upsertUser({
        id: localUser.claims.sub,
        email: localUser.claims.email,
        firstName: localUser.claims.first_name,
        lastName: localUser.claims.last_name,
        profileImageUrl: localUser.claims.profile_image_url,
      });

      const request = req as any;
      request.login(localUser, (err: any) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/home");
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/callback", (req, res, next) => {
    if (!config) {
      return res.redirect("/api/local-login");
    }
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      if (useLocalDevAuth || useLocalProdAuth || !config) {
        // In local dev or when OIDC is not configured, just go to the landing page
        return res.redirect("/");
      }
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
