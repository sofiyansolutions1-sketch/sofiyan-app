const name = "AC Basic Check-up/Cooling";
const url = "ac-basic-check-upcooling";
const slug1 = name.replace(/\s+/g, '-').toLowerCase();
const slug2 = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
const slug3 = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

console.log("slug1:", slug1);
console.log("slug2:", slug2);
console.log("slug3:", slug3);
console.log("url:", url);
console.log("Matches slug3?", slug3 === url);
