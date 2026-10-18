// Public demo accounts for the frontend simulator only.
// These credentials are intentionally bundled with the app; do not use real accounts here.
export const mockUsers = [
  {
    id: "user-001",
    name: "Demo Shopper",
    username: "demo",
    email: "demo@shopiz.com",
    phone: "0901234567",
    password: "Shopiz@123",
  },
  {
    id: "user-002",
    name: "Alex Nguyen",
    username: "alex",
    email: "alex@shopiz.com",
    phone: "0912345678",
    password: "Shopiz@123",
  },
];

export function authenticateMockUser(identity, password) {
  const identifier = identity.trim().toLowerCase();
  const phone = identifier.replace(/[\s().-]/g, "");
  const user = mockUsers.find(
    (user) =>
      (user.email.toLowerCase() === identifier ||
        user.username.toLowerCase() === identifier ||
        user.phone === phone) &&
      user.password === password,
  );
  return user ? toPublicUser(user) : null;
}

export function toPublicUser({ id, name, username, email, phone }) {
  return { id, name, username, email, phone };
}
