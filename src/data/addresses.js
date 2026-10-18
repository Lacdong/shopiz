export const sampleAddresses = [
  {
    id: "home",
    name: "Demo Shopper",
    phone: "0901234567",
    street: "12 Example Street",
    ward: "Ben Nghe",
    district: "District 1",
    city: "Ho Chi Minh City",
    label: "Home",
    isDefault: true,
  },
  {
    id: "work",
    name: "Demo Shopper",
    phone: "0901234567",
    street: "24 Sample Avenue",
    ward: "Dich Vong",
    district: "Cau Giay",
    city: "Hanoi",
    label: "Office",
    isDefault: false,
  },
];
export function validateAddress(address) {
  const errors = {};
  if (address.name.trim().length < 2)
    errors.name = "Enter the recipient’s full name.";
  if (!/^\+?\d{9,15}$/.test(address.phone.replace(/[\s().-]/g, "")))
    errors.phone = "Enter a valid phone number (9–15 digits).";
  if (address.street.trim().length < 5)
    errors.street = "Enter a complete street address.";
  for (const key of ["ward", "district", "city"])
    if (!address[key].trim()) errors[key] = `Enter your ${key}.`;
  return errors;
}
export const formatAddress = (address) =>
  [address.street, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");
