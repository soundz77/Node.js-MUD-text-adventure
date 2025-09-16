// utils/createId.js
import { createHash } from "crypto";

const hash7 = (s) =>
  createHash("sha1").update(String(s)).digest("hex").slice(0, 7);

export default {
  make(ns) {
    const rand = Math.random().toString(16).slice(2, 10);
    return `${ns}:${rand}`;
  },
  fromSlug(ns, slug) {
    return `${ns}:${hash7(slug)}`;
  }
};
