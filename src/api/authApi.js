import axiosClient from "./axiosClient";

export const login = async (email, password) => {
  // Firebase Auth login
  const { auth } = await import("../firebase/firebase");
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const { rtdb } = await import("../firebase/firebase");
  const {
    ref,
    set,
    get,
    child,
    query,
    orderByChild,
    equalTo,
  } = await import("firebase/database");

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  const token = await user.getIdToken();

  // Ensure admin root exists (seed once if missing) AFTER auth
  // Path: admins/yashraj
  try {
    const adminSnap = await get(child(ref(rtdb), "admins/yashraj"));
    if (!adminSnap.exists()) {
      await set(ref(rtdb, "admins/yashraj"), {
        name: "yashraj",
        email: "admin@admin.com",
        password: "admin123",
      });
    }
  } catch {}

  // Determine role: check admins by email
  let role = "user";
  let resolvedName = user.displayName || "";
  try {
    const adminsByEmail = query(
      ref(rtdb, "admins"),
      orderByChild("email"),
      equalTo(user.email || email)
    );
    const qSnap = await get(adminsByEmail);
    if (qSnap.exists()) {
      role = "admin";
      const val = qSnap.val();
      const firstKey = Object.keys(val)[0];
      if (firstKey && val[firstKey]?.name) {
        resolvedName = val[firstKey].name;
      }
    } else {
      // Fallback: fetch admins root and compare
      const allAdminsSnap = await get(child(ref(rtdb), "admins"));
      if (allAdminsSnap.exists()) {
        const map = allAdminsSnap.val() || {};
        for (const k of Object.keys(map)) {
          if ((map[k]?.email || "").toLowerCase() === (user.email || email || "").toLowerCase()) {
            role = "admin";
            resolvedName = map[k]?.name || resolvedName;
            break;
          }
        }
      }
    }
  } catch {}
  // Final fallback: explicit email match
  if (role !== "admin" && (user.email || email) === "admin@admin.com") {
    role = "admin";
    resolvedName = resolvedName || "yashraj";
  }

  // Persist token and user with resolved role
  localStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      uid: user.uid,
      name: resolvedName,
      email: user.email,
      role,
    })
  );

  return { message: "Login successful", role };
};

export const registerUser = async (payload) => {
  // Firebase Auth registration
  const { auth } = await import("../firebase/firebase");
  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "firebase/auth"
  );
  const { rtdb } = await import("../firebase/firebase");
  const { ref, set, serverTimestamp } = await import("firebase/database");

  const cred = await createUserWithEmailAndPassword(
    auth,
    payload.email,
    payload.password
  );
  if (payload.name) {
    await updateProfile(cred.user, { displayName: payload.name });
  }
  const token = await cred.user.getIdToken();

  await set(ref(rtdb, `users/${cred.user.uid}`), {
    uid: cred.user.uid,
    name: payload.name || "",
    email: cred.user.email,
    role: "user",
    createdAt: serverTimestamp(),
  });

  localStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      uid: cred.user.uid,
      name: payload.name || "",
      email: cred.user.email,
      role: "user",
    })
  );

  return { message: "User registered successfully" };
};
