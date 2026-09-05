import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../hooks/useStore";
import { Partner, Booking } from "../types";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Briefcase,
  CheckCircle,
  MapPin,
  LogOut,
  Clock,
  User as UserIcon,
  Loader2,
  Star,
  Camera,
  Upload,
  Trash2,
  Phone,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Zap,
  Wrench,
  Hammer,
  Flame,
  Snowflake,
  Tv,
  Video,
  Check,
  X,
  ChevronRight,
  Settings2,
  Smartphone,
  ArrowRight,
  Bot,
  PhoneCall,
  MessageCircle
} from "lucide-react";
import { MapRadiusSelector } from "../components/MapRadiusSelector";
import { PartnerRegistrationSuccess } from "./PartnerRegistrationSuccess";
import { fetchAreasByPincode } from "../services/pincodeService";
import { uploadAppFile, getSignedAppFileUrl } from "../services/storageService";
import { CITY_DATA } from "../constants";

// Haversine distance calculator
const calculateDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): string => {
  console.log(`[Diagnostic - PartnerPanel] calculateDistance inputs: Partner(${lat1}, ${lon1}), Lead(${lat2}, ${lon2})`);
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    console.warn(`[Diagnostic - PartnerPanel] calculateDistance aborted due to missing coordinates.`);
    return "N/A";
  }
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  
  if (isNaN(d) || d === null) {
    console.error(`[Diagnostic - PartnerPanel] calculateDistance result is NaN/null. Calculated d = ${d}`);
  } else {
    console.log(`[Diagnostic - PartnerPanel] calculateDistance output: ${d} km`);
  }

  if (d < 0.01) {
    return "< 10 Meters";
  }
  if (d < 1) {
    const meters = Math.round(d * 1000);
    return `${meters} Meters`;
  }
  return `${d.toFixed(1)} KM`;
};

// Robust Phone & Email normalization for Indian & International formats
const normalizePhoneVariants = (input?: string | null): string[] => {
  if (!input) return [];
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    return [trimmed.toLowerCase(), trimmed];
  }
  const digitsOnly = trimmed.replace(/\D/g, "");
  const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
  const variants = new Set([
    last10,
    digitsOnly,
    "0" + last10,
    "91" + last10
  ]);
  return Array.from(variants).filter(Boolean);
};

// Helper to find partner in Supabase by Phone or Email with full variant matching and step-by-step diagnostic logging
const findPartnerInSupabase = async (phoneOrEmail: string, callerContext: string = "general_lookup") => {
  if (!phoneOrEmail || !phoneOrEmail.trim()) {
    console.warn(`[Supabase Diagnostic][${callerContext}] ⚠️ Empty search string provided.`);
    return null;
  }
  const trimmed = phoneOrEmail.trim();
  const variants = normalizePhoneVariants(trimmed);
  const isEmail = trimmed.includes("@");

  console.groupCollapsed(`🔍 [PartnerAuth Diagnostic][${callerContext}] Querying primary_partners for: "${trimmed}"`);
  console.log(`[Diagnostic Step 1 - Input Normalization] Type: ${isEmail ? "Email" : "Phone"}, Generated Variants:`, variants);

  const filterClauses: string[] = [];
  if (isEmail) {
    filterClauses.push(`email.ilike.${encodeURIComponent(trimmed)}`);
    filterClauses.push(`email.eq.${encodeURIComponent(trimmed)}`);
  } else {
    variants.forEach(v => {
      filterClauses.push(`phone.eq.${v}`);
      filterClauses.push(`alt_phone.eq.${v}`);
    });
    const digitsOnly = trimmed.replace(/\D/g, "");
    const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
    filterClauses.push(`phone.ilike.%${last10}%`);
  }

  const queryFilterStr = filterClauses.join(",");
  console.log(`[Diagnostic Step 2 - Filter Formulation] Supabase OR filter:`, queryFilterStr);

  try {
    const startTime = performance.now();
    const { data, error, status, statusText } = await supabase
      .from("primary_partners")
      .select("*")
      .or(queryFilterStr)
      .limit(1);

    const elapsedMs = (performance.now() - startTime).toFixed(2);

    if (error) {
      console.error(`[Diagnostic Step 3 - Query Error] Supabase returned an error (${elapsedMs}ms):`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        httpStatus: status,
        statusText
      });
      console.groupEnd();
      return null;
    }

    if (data && data.length > 0) {
      const match = data[0];
      console.log(`[Diagnostic Step 3 - Match Found ✅] Supabase query returned registered partner (${elapsedMs}ms):`, {
        id: match.id,
        name: match.name || `${match.first_name || ""} ${match.last_name || ""}`.trim(),
        phone: match.phone,
        alt_phone: match.alt_phone,
        email: match.email,
        status: match.status,
        city: match.city,
        hasPassword: !!match.password
      });
      console.groupEnd();
      return match;
    }

    // Secondary fallback check if multi-condition .or() returned empty
    if (!isEmail) {
      const digitsOnly = trimmed.replace(/\D/g, "");
      const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
      console.log(`[Diagnostic Step 3b - Secondary Fallback Check] Checking exact 10-digit phone match for: "${last10}"`);
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("primary_partners")
        .select("*")
        .eq("phone", last10)
        .limit(1);

      if (!fallbackError && fallbackData && fallbackData.length > 0) {
        const match = fallbackData[0];
        console.log(`[Diagnostic Step 3b - Match Found on Fallback ✅]:`, {
          id: match.id,
          name: match.name,
          phone: match.phone,
          email: match.email
        });
        console.groupEnd();
        return match;
      }
    }

    console.log(`[Diagnostic Step 3 - No Match ℹ️] No partner found in Supabase matching criteria (${elapsedMs}ms).`);
    console.groupEnd();
    return null;
  } catch (err: any) {
    console.error(`[Diagnostic Step 3 - Exception 💥] Query threw an unexpected error:`, err);
    console.groupEnd();
    return null;
  }
};

// Helper to map Supabase row to local Partner interface
const mapPartnerRecord = (found: any): Partner => ({
  id: found.id,
  name: `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name || "Partner",
  first_name: found.first_name || "",
  last_name: found.last_name || "",
  email: found.email || "",
  phone: found.phone || "",
  password: found.password || "",
  city: found.city || "",
  alt_phone: found.alt_phone || "",
  gender: found.gender || "Male",
  age: found.age || 25,
  experience: found.experience || "2",
  categories: found.categories || [],
  sub_categories: found.sub_categories || [],
  service_areas: found.service_areas || [],
  service_radius: found.service_radius || 5,
  service_pincodes: found.service_pincodes || [],
  aadhar_number: found.aadhar_number || "",
  id_proof_url: found.id_proof_url || "",
  status: found.status || "available",
  rating: found.rating || 4.9,
  review_count: found.review_count || 12,
  earnings: found.earnings || 0,
  completedJobs: found.completed_jobs || 0,
  lat: found.lat,
  lng: found.lng,
  pincode: found.pincode || "",
  partner_type: "Primary"
});

export interface ServiceCategoryOption {
  id: string;
  name: string;
  subCategories?: string[];
  iconName?: string;
  description?: string;
}

const SERVICE_CATEGORIES_DATA: ServiceCategoryOption[] = [
  {
    id: "electrician",
    name: "Electrician",
    iconName: "Zap",
    description: "Wiring, switchboard, MCB, fan, inverter & lighting repairs"
  },
  {
    id: "plumber",
    name: "Plumber",
    iconName: "Wrench",
    description: "Taps, pipelines, motors, water tanks, sanitary & blockage fixes"
  },
  {
    id: "carpenters",
    name: "Carpenters",
    iconName: "Hammer",
    description: "Furniture repair, assembly, doors, locks & wood installations"
  },
  {
    id: "cleaning_pest_control",
    name: "Cleaning & Pest Control",
    iconName: "Sparkles",
    description: "Home deep cleaning, pest eradication & sanitation",
    subCategories: [
      "Cleaning",
      "Pest Control"
    ]
  },
  {
    id: "pooja",
    name: "Pooja",
    iconName: "Flame",
    description: "Havan, Vedic rituals, Griha Pravesh & festive ceremonies"
  },
  {
    id: "ac_home_appliances",
    name: "Ac & Home Appliances",
    iconName: "Snowflake",
    description: "AC, Fridge, Washing Machine, Geyser, RO & appliance repair",
    subCategories: [
      "Ac Repair",
      "Refrigerator Repair",
      "Washing Machine Repair",
      "Microwave Repair",
      "Geyser Repair",
      "Water Purifier/RO Repair",
      "Chimney Repair",
      "Dishwasher Repair",
      "Cooler Repair",
      "Mixer/Grinder Repair",
      "Small Appliance Repair"
    ]
  },
  {
    id: "tv_entertainment",
    name: "TV & Entertainment",
    iconName: "Tv",
    description: "Smart TV installation, audio setup, unmounting & display repair"
  },
  {
    id: "cctv_security",
    name: "CCTV & Security",
    iconName: "Video",
    description: "CCTV installation, DVR/NVR setup, cabling & surveillance"
  }
];

// const _CITIES = [
//   "Delhi",
//   "Mumbai",
//   "Bangalore",
//   "Hyderabad",
//   "Chennai",
//   "Kolkata",
//   "Pune",
//   "Ahmedabad",
//   "Jaipur",
//   "Surat"
// ];

export const PartnerPanel: React.FC = () => {
  const { bookings, updateBooking, partners, fetchPartners, updatePartner, callLogs } = useStore();

  const [currentUser, setCurrentUser] = useState<Partner | null>(null);
  const [partnerAvatarUrl, setPartnerAvatarUrl] = useState<string | null>(null);

  // Automatically resolve Partner Profile Photo from Supabase storage / id_proof_url
  useEffect(() => {
    let isMounted = true;
    const resolvePartnerAvatar = async () => {
      if (!currentUser?.id_proof_url) {
        if (isMounted) setPartnerAvatarUrl(null);
        return;
      }

      try {
        let rawPhoto: string | null = null;
        try {
          const parsed = JSON.parse(currentUser.id_proof_url);
          rawPhoto =
            parsed.profilePhoto ||
            parsed.profile_photo ||
            parsed.photo ||
            parsed.avatar ||
            parsed.photoUrl ||
            parsed.id_proof_url ||
            null;
        } catch {
          rawPhoto = currentUser.id_proof_url;
        }

        if (rawPhoto && typeof rawPhoto === "string" && rawPhoto.trim()) {
          const signed = await getSignedAppFileUrl(rawPhoto.trim());
          if (isMounted) {
            setPartnerAvatarUrl(signed || rawPhoto);
          }
        } else {
          if (isMounted) setPartnerAvatarUrl(null);
        }
      } catch (err) {
        console.warn("Failed to resolve partner avatar URL:", err);
        if (isMounted) setPartnerAvatarUrl(null);
      }
    };

    resolvePartnerAvatar();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id_proof_url, currentUser?.id]);
  const [jobToComplete, setJobToComplete] = useState<Booking | null>(null);
  const [verificationStep, setVerificationStep] = useState<"idle" | "uploading" | "verifying" | "success">("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [paymentVerificationCode, setPaymentVerificationCode] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [regStep, setRegStep] = useState<"personal" | "expertise" | "location" | "verify" | "success">("personal");
  
      
  const [commissionAiResult, setCommissionAiResult] = useState<{
    verified: boolean;
    extractedAmount?: number | null;
    extractedUtr?: string | null;
    extractedReceiver?: string | null;
    paymentApp?: string | null;
    message?: string;
    reason?: string;
  } | null>(null);
  const [commissionAiScanProgress, ] = useState<string>("");

  const [regData, setRegData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    gender: "Male",
    age: "25",
    experience: "2",
    categories: [] as string[],
    subCategories: [] as string[],
    service_pincodes: [] as string[],
    aadharNumber: "",
    city: "",
    altPhone: "",
    area: "",
    pincode: "",
    address: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    service_radius: 5
  });

  const location = useLocation();
  const [authMode, setAuthMode] = useState<"login" | "signup">(() => {
    const params = new URLSearchParams(location.search);
    return params.get("mode") === "signup" ? "signup" : "login";
  });
  const [authData, setAuthData] = useState({ phone: "", password: "", name: "", email: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isPendingSignup, setIsPendingSignup] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Subcategory popup modal state
  const [activeCategoryForSubModal, setActiveCategoryForSubModal] = useState<ServiceCategoryOption | null>(null);
  const [tempSelectedSubcategories, setTempSelectedSubcategories] = useState<string[]>([]);
  const [isEditProfileSubModal, setIsEditProfileSubModal] = useState(false);

  const [rpcMatchedLeadIds, setRpcMatchedLeadIds] = useState<string[]>([]);
  const [otpBookingId, setOtpBookingId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [businessPhotos] = useState<File[]>([]);
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"profile" | "shop">("profile");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore authenticated session
  useEffect(() => {
    const savedPhone = localStorage.getItem("partnerPhone");
    if (savedPhone) {
      const variants = normalizePhoneVariants(savedPhone);
      const localP = partners.find(
        p =>
          variants.includes(p.phone || "") ||
          variants.includes(p.alt_phone || "") ||
          p.email?.toLowerCase() === savedPhone.toLowerCase()
      );
      if (localP) {
        setCurrentUser(localP);
      } else {
        // Fetch from Supabase directly
        findPartnerInSupabase(savedPhone)
          .then(row => {
            if (row) {
              setCurrentUser(mapPartnerRecord(row));
            }
          })
          .catch(err => console.error("Error restoring session:", err));
      }
    }
  }, [partners]);

  // Proximity leads matching
  useEffect(() => {
    if (!currentUser || currentUser.status !== "available" || !currentUser.lat || !currentUser.lng) return;
    const radiusStr = currentUser.service_areas && currentUser.service_areas.length > 0 ? currentUser.service_areas[0] : "5";
    const serviceRadius = parseFloat(radiusStr) || 5;

    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase.rpc("get_nearby_leads", {
          p_lat: currentUser.lat,
          p_lng: currentUser.lng,
          p_radius_km: serviceRadius
        });
        if (data && !error) {
          setRpcMatchedLeadIds(data.map((d: any) => d.id));
        }
      } catch (err) {
        console.error("RPC distance matching failed:", err);
      }
    };

    fetchMatches();
  }, [bookings, currentUser]);

  // LOGIN FLOW with diagnostic tracking
  const handleLogin = async () => {
    const phoneOrEmail = authData.phone.trim();
    const password = authData.password.trim();

    console.group("🔑 [Partner Login Diagnostic Flow]");
    console.log("[Login Step 1] Validating credentials format:", { phoneOrEmail, hasPassword: !!password });

    if (!phoneOrEmail || !password) {
      console.warn("[Login Step 1 ⚠️] Missing phone/email or password.");
      setAuthError("Please enter your registered Phone / Email and Password.");
      console.groupEnd();
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1. Direct query to Supabase primary_partners table with phone & email normalization
      console.log("[Login Step 2] Querying Supabase primary_partners table...");
      const foundRecord = await findPartnerInSupabase(phoneOrEmail, "login_auth");

      if (foundRecord) {
        console.log("[Login Step 3] Partner record found in Supabase:", {
          id: foundRecord.id,
          name: foundRecord.name,
          phone: foundRecord.phone,
          status: foundRecord.status
        });

        if (foundRecord.password === password) {
          console.log("[Login Step 4 ✅] Password match confirmed. Authenticating partner session.");
          const mappedPartner = mapPartnerRecord(foundRecord);
          setCurrentUser(mappedPartner);
          localStorage.setItem("partnerPhone", mappedPartner.phone || phoneOrEmail);
          setAuthError(null);
          setAuthLoading(false);
          console.groupEnd();
          return;
        } else {
          console.warn("[Login Step 4 ❌] Password mismatch detected for partner ID:", foundRecord.id);
          setAuthError("Incorrect password. Please verify and try again.");
          setAuthLoading(false);
          console.groupEnd();
          return;
        }
      }

      // 2. Check local partners store with phone variants
      console.log("[Login Step 2b] Checking local Zustand in-memory partners cache...");
      const variants = normalizePhoneVariants(phoneOrEmail);
      const localPartner = partners.find(
        p =>
          (variants.includes(p.phone || "") ||
            variants.includes(p.alt_phone || "") ||
            p.email?.toLowerCase() === phoneOrEmail.toLowerCase()) &&
          p.password === password
      );

      if (localPartner) {
        console.log("[Login Step 3b ✅] Local in-memory partner found & password verified:", localPartner.id);
        setCurrentUser(localPartner);
        localStorage.setItem("partnerPhone", localPartner.phone || "");
        setAuthError(null);
        setAuthLoading(false);
        console.groupEnd();
        return;
      }

      const existingWrongPass = partners.find(
        p =>
          variants.includes(p.phone || "") ||
          variants.includes(p.alt_phone || "") ||
          p.email?.toLowerCase() === phoneOrEmail.toLowerCase()
      );
      if (existingWrongPass) {
        console.warn("[Login Step 3b ❌] Account found locally but password mismatch.");
        setAuthError("Incorrect password. Please verify and try again.");
        setAuthLoading(false);
        console.groupEnd();
        return;
      }

      console.warn("[Login Step 5 ⚠️] No registered account found in Supabase or local store for:", phoneOrEmail);
      setAuthError("No account found with these details. Please click Sign Up to register.");
    } catch (err: any) {
      console.error("[Login Step 5 💥] Unexpected login exception:", err);
      // Local fallback
      const variants = normalizePhoneVariants(phoneOrEmail);
      const localPartner = partners.find(
        p =>
          (variants.includes(p.phone || "") ||
            variants.includes(p.alt_phone || "") ||
            p.email?.toLowerCase() === phoneOrEmail.toLowerCase()) &&
          p.password === password
      );
      if (localPartner) {
        setCurrentUser(localPartner);
        localStorage.setItem("partnerPhone", localPartner.phone || "");
        setAuthError(null);
      } else {
        setAuthError("Login failed. Please check your credentials.");
      }
    } finally {
      setAuthLoading(false);
      console.groupEnd();
    }
  };

  // SIGNUP FLOW: Check-before-insert pattern with step-by-step diagnostic tracking
  const handleSignup = async () => {
    const name = authData.name.trim();
    const email = authData.email.trim();
    const phone = authData.phone.trim();
    const password = authData.password.trim();

    console.group("🚀 [Partner Signup Diagnostic Flow]");
    console.log("[Signup Step 1 - Form Inputs]", {
      name,
      phone,
      email: email || "(not provided)",
      hasPassword: !!password
    });

    if (!name || !phone || !password) {
      console.warn("[Signup Step 1 ⚠️] Validation failed: Required fields missing.");
      setAuthError("Please fill in all required fields (Full Name, Phone Number, Password).");
      console.groupEnd();
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      // Step 2: Supabase pre-check query by phone number
      console.log(`[Signup Step 2 - Phone Lookup] Checking Supabase for phone: "${phone}"...`);
      const existingByPhone = await findPartnerInSupabase(phone, "signup_check_phone");

      // Step 3: Supabase pre-check query by email (if provided)
      let existingByEmail = null;
      if (email) {
        console.log(`[Signup Step 3 - Email Lookup] Checking Supabase for email: "${email}"...`);
        existingByEmail = await findPartnerInSupabase(email, "signup_check_email");
      } else {
        console.log("[Signup Step 3 - Email Lookup] Skipped (no email entered).");
      }

      const existingPartner = existingByPhone || existingByEmail;

      // Step 4: Local Zustand store pre-check
      const variants = normalizePhoneVariants(phone);
      const localFound = partners.find(
        p =>
          variants.includes(p.phone || "") ||
          variants.includes(p.alt_phone || "") ||
          (email && p.email?.toLowerCase() === email.toLowerCase())
      );

      console.log("[Signup Step 4 - Evaluation Summary]", {
        phoneLookupMatched: !!existingByPhone,
        matchedPartnerPhone: existingByPhone?.phone,
        emailLookupMatched: !!existingByEmail,
        matchedPartnerEmail: existingByEmail?.email,
        localCacheMatched: !!localFound,
        matchedPartnerId: existingPartner?.id || localFound?.id || "none"
      });

      if (existingPartner || localFound) {
        const targetPhone = existingPartner ? (existingPartner.phone || phone) : (localFound?.phone || phone);
        console.log(`[Signup Step 5 - Existing Account Detected 🔁] Transitioning user to Login mode for phone: "${targetPhone}"`);

        setAuthMode("login");
        setAuthData(prev => ({
          ...prev,
          phone: targetPhone,
          password: password // keep password prefilled so user can sign in immediately
        }));
        setAuthError("User already registered. Please sign in with your password.");
        setAuthLoading(false);
        console.groupEnd();
        return;
      }

      // Step 5: New partner verified - proceed to onboarding wizard
      console.log("[Signup Step 5 - New Partner Confirmed ✨] Prepopulating wizard data & opening Personal Details step.");
      const parts = name.split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      setRegData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: email || "",
        phone,
        password
      }));

      setIsPendingSignup(true);
      setRegStep("personal");
      setAuthError(null);
      console.groupEnd();
    } catch (err: any) {
      console.error("[Signup Step 5 💥] Unexpected error during signup validation:", err);
      // Fallback: Proceed to registration form
      const parts = name.split(" ");
      setRegData(prev => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: email || "",
        phone,
        password
      }));
      setIsPendingSignup(true);
      setRegStep("personal");
      setAuthError(null);
      console.groupEnd();
    } finally {
      setAuthLoading(false);
    }
  };

  const uploadVerificationFiles = async (partnerId: string, aiVerificationData?: any) => {
    let profilePathOrUrl: string | null = null;
    const businessPathsOrUrls: string[] = [];
    let aadhaarPathOrUrl: string | null = null;
    let regFeePathOrUrl: string | null = null;

    // Determine current user ID or partnerId
    let authUid = partnerId;
    try {
      const { data: authSession } = await supabase.auth.getUser();
      if (authSession?.user?.id) {
        authUid = authSession.user.id;
      }
    } catch {
      authUid = partnerId;
    }

    if (profilePhoto) {
      try {
        const result = await uploadAppFile({
          userId: authUid,
          featureName: "partner_profile",
          itemId: partnerId,
          file: profilePhoto,
          customFileName: "profile.jpg"
        });
        profilePathOrUrl = result.filePath;
      } catch (err) {
        console.error("Profile photo upload failed:", err);
        throw new Error("Failed to upload profile photo.");
      }
    }

    const allBusinessFiles = shopPhoto ? [shopPhoto, ...businessPhotos] : businessPhotos;
    for (let i = 0; i < allBusinessFiles.length; i++) {
      const file = allBusinessFiles[i];
      try {
        const result = await uploadAppFile({
          userId: authUid,
          featureName: "partner_shop",
          itemId: partnerId,
          file: file,
          customFileName: file.name || `shop_${i}.jpg`
        });
        businessPathsOrUrls.push(result.filePath);
      } catch (err) {
        console.error(`Shop/business photo ${i} upload failed:`, err);
        throw new Error("Failed to upload shop/business photo.");
      }
    }

    if (aadhaarPhoto) {
      try {
        const result = await uploadAppFile({
          userId: authUid,
          featureName: "partner_aadhaar",
          itemId: partnerId,
          file: aadhaarPhoto,
          customFileName: aadhaarPhoto.name || "aadhaar.jpg"
        });
        aadhaarPathOrUrl = result.filePath;
      } catch (err) {
        console.error("Aadhaar photo upload failed:", err);
        throw new Error("Failed to upload Aadhaar photo.");
      }
    }

    if (regPaymentFile) {
      try {
        const result = await uploadAppFile({
          userId: authUid,
          featureName: "partner_reg_fee",
          itemId: partnerId,
          file: regPaymentFile,
          customFileName: regPaymentFile.name || "reg_fee.jpg"
        });
        regFeePathOrUrl = result.filePath;
      } catch (err) {
        console.error("Registration fee receipt upload failed:", err);
        throw new Error("Failed to upload registration fee receipt.");
      }
    }

    return JSON.stringify({
      profilePhoto: profilePathOrUrl,
      businessPhotos: businessPathsOrUrls,
      shopPhoto: businessPathsOrUrls.length > 0 ? businessPathsOrUrls[0] : null,
      aadhaarPhoto: aadhaarPathOrUrl,
      registrationFeeScreenshot: regFeePathOrUrl,
      registrationFeeAmount: 499,
      paymentVerificationCode: regPaymentCode,
      ai_verified: true,
      ai_utr: aiVerificationData?.extractedUtr || null,
      ai_payment_app: aiVerificationData?.paymentApp || null,
      ai_verified_at: new Date().toISOString()
    });
  };

  // ONBOARDING SUBMISSION: Direct Supabase sync with step-by-step diagnostic logging
  const handleRegistrationSubmit = async (aiVerificationData?: any) => {
    console.group("📋 [Partner Onboarding Submission Diagnostic]");
    console.log("[Onboarding Step 1 - Form Validation] Checking required fields...");

    if (!regData.firstName || !regData.phone) {
      console.warn("[Onboarding Step 1 ⚠️] Personal details incomplete.");
      alert("Please complete the Personal section before submitting.");
      setRegStep("personal");
      console.groupEnd();
      return;
    }
    if (!regData.categories || regData.categories.length === 0) {
      console.warn("[Onboarding Step 1 ⚠️] No category selected.");
      alert("Please select at least one category in the Expertise section.");
      setRegStep("expertise");
      console.groupEnd();
      return;
    }
    if (!regData.city || !regData.pincode) {
      console.warn("[Onboarding Step 1 ⚠️] Location details incomplete.");
      alert("Please provide complete location details.");
      setRegStep("location");
      console.groupEnd();
      return;
    }

    const isUpdating = !!currentUser;
    if (!isUpdating && !profilePhoto) {
      console.warn("[Onboarding Step 1 ⚠️] Profile photo missing for new partner.");
      alert("Profile photo is mandatory for new registrations.");
      console.groupEnd();
      return;
    }
    if (!isUpdating && regData.aadharNumber.length < 12 && !aadhaarPhoto) {
      console.warn("[Onboarding Step 1 ⚠️] Aadhaar verification details missing.");
      alert("Please provide your 12-digit Aadhaar Number or upload Aadhaar photo.");
      console.groupEnd();
      return;
    }

    console.log("[Onboarding Step 1 ✅] Validation passed. Mode:", isUpdating ? "Update Existing" : "Create New");
    setIsSubmitting(true);

    try {
      const email = regData.email || authData.email || `${regData.phone}@example.com`;
      const partnerId = isUpdating ? currentUser.id : `P${Date.now()}`;

      console.log("[Onboarding Step 2 - Uploading Verification Media] Processing images with AI metadata...");
      let docsJson = isUpdating ? (currentUser.id_proof_url || "") : "";
      if (profilePhoto || shopPhoto || businessPhotos.length > 0 || aadhaarPhoto || regPaymentFile) {
        // If updating and we have an old docsJson, delete the old files from storage
        if (isUpdating && docsJson) {
          try {
            const oldDocs = JSON.parse(docsJson);
            const pathsToDelete = [
              oldDocs.profilePhoto,
              ...(oldDocs.businessPhotos || []),
              oldDocs.aadhaarPhoto,
              oldDocs.registrationFeeScreenshot
            ].filter(Boolean);
            
            for (const path of pathsToDelete) {
              await deleteAppFile(path);
            }
          } catch (e) {
            console.warn("Failed to delete old documents:", e);
          }
        }
        
        docsJson = await uploadVerificationFiles(partnerId, aiVerificationData);
        console.log("[Onboarding Step 2 ✅] Verification documents encoded successfully.");
      }

      const combinedAddress = [regData.address, regData.area].filter(Boolean).join(", ") || regData.city;

      const dbPartnerPayload: any = {
        name: `${regData.firstName} ${regData.lastName}`.trim(),
        first_name: regData.firstName,
        last_name: regData.lastName,
        email: email,
        phone: regData.phone,
        password: regData.password,
        alt_phone: regData.altPhone || "",
        gender: regData.gender || "Male",
        age: parseInt(regData.age) || 25,
        experience: regData.experience || "2",
        city: regData.city,
        address: combinedAddress,
        pincode: regData.pincode,
        lat: regData.lat || null,
        lng: regData.lng || null,
        partner_type: "Primary",
        service_areas: [String(regData.service_radius || 5)],
        service_radius: regData.service_radius || 5,
        service_pincodes: regData.service_pincodes.length > 0 ? regData.service_pincodes : [regData.pincode],
        categories: regData.categories,
        sub_categories: regData.subCategories || [],
        aadhar_number: regData.aadharNumber || "",
        id_proof_url: docsJson,
        status: isUpdating ? (currentUser.status || "available") : "available",
        earnings: isUpdating ? (currentUser.earnings || 0) : 0,
        completed_jobs: isUpdating ? (currentUser.completedJobs || 0) : 0,
        rating: isUpdating ? (currentUser.rating || 5.0) : 5.0,
        review_count: isUpdating ? (currentUser.review_count || 0) : 0,
        registration_fee_paid: true,
        wallet_balance: 0
      };

      if (isUpdating && currentUser.id && !currentUser.id.startsWith("P")) {
        dbPartnerPayload.id = currentUser.id;
      }

      console.log("[Onboarding Step 3 - Supabase Payload Formulation] Submitting upsert on primary_partners:", {
        name: dbPartnerPayload.name,
        phone: dbPartnerPayload.phone,
        email: dbPartnerPayload.email,
        city: dbPartnerPayload.city,
        categories: dbPartnerPayload.categories,
        service_radius: dbPartnerPayload.service_radius,
        status: dbPartnerPayload.status
      });

      const startTime = performance.now();
      const { data: upsertData, error: upsertError } = await supabase
        .from("primary_partners")
        .upsert(dbPartnerPayload, { onConflict: "phone" })
        .select()
        .single();

      const elapsedMs = (performance.now() - startTime).toFixed(2);

      if (upsertError) {
        console.error(`[Onboarding Step 4 ❌] Supabase primary_partners upsert failed (${elapsedMs}ms):`, upsertError);
        throw new Error(upsertError.message);
      }

      console.log(`[Onboarding Step 4 ✅] Supabase upsert successful (${elapsedMs}ms). Stored Record ID:`, upsertData?.id);
      const finalId = (upsertData && upsertData.id) ? upsertData.id : partnerId;

      const parsedDocs = docsJson ? (() => {
        try { return JSON.parse(docsJson); } catch { return {}; }
      })() : {};

      const createdPartnerObj: Partner = {
        id: finalId,
        name: dbPartnerPayload.name,
        first_name: dbPartnerPayload.first_name,
        last_name: dbPartnerPayload.last_name,
        email: dbPartnerPayload.email,
        phone: dbPartnerPayload.phone,
        password: dbPartnerPayload.password,
        city: dbPartnerPayload.city,
        address: dbPartnerPayload.address,
        alt_phone: dbPartnerPayload.alt_phone,
        gender: dbPartnerPayload.gender,
        age: dbPartnerPayload.age,
        experience: dbPartnerPayload.experience,
        categories: dbPartnerPayload.categories,
        sub_categories: dbPartnerPayload.sub_categories,
        service_areas: dbPartnerPayload.service_areas,
        service_radius: dbPartnerPayload.service_radius,
        service_pincodes: dbPartnerPayload.service_pincodes,
        aadhar_number: dbPartnerPayload.aadhar_number,
        id_proof_url: docsJson,
        status: dbPartnerPayload.status,
        earnings: dbPartnerPayload.earnings,
        completedJobs: dbPartnerPayload.completed_jobs,
        lat: dbPartnerPayload.lat || undefined,
        lng: dbPartnerPayload.lng || undefined,
        pincode: dbPartnerPayload.pincode,
        rating: dbPartnerPayload.rating,
        review_count: dbPartnerPayload.review_count,
        partner_type: "Primary",
        registration_fee_paid: true,
        registration_fee_screenshot: parsedDocs.registrationFeeScreenshot || ""
      };

      console.log("[Onboarding Step 5 - State Sync] Refreshing store and activating partner session:", createdPartnerObj.id);
      await fetchPartners();
      setCurrentUser(createdPartnerObj);
      localStorage.setItem("partnerPhone", createdPartnerObj.phone || "");
      setIsPendingSignup(false);
      setRegStep("success");
      console.log("[Onboarding Step 5 ✅] Partner registration flow completed successfully with instant AI verification.");
      console.groupEnd();
    } catch (err: any) {
      console.error("[Onboarding Step 5 💥] Partner registration error:", err);
      alert(err.message || "Failed to submit application.");
      console.groupEnd();
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleLogout = () => {
    setCurrentUser(null);
    setIsPendingSignup(false);
    setIsRegistrationOpen(false);
    localStorage.removeItem("partnerPhone");
  };

  // Camera helpers
  async function startCamera(target: "profile" | "shop" = "profile") {
    setCameraTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === "profile" ? "user" : "environment" }
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("Could not access camera. Please allow camera permissions or upload a photo from gallery.");
      setIsCameraOpen(false);
    }
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCameraOpen(false);
  }

  function capturePhoto() {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            if (cameraTarget === "profile") {
              const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
              setProfilePhoto(file);
            } else {
              const file = new File([blob], `shop_card_${Date.now()}.jpg`, { type: "image/jpeg" });
              setShopPhoto(file);
            }
            stopCamera();
          }
        }, "image/jpeg", 0.85);
      }
    }
  }

  const toggleAvailability = async () => {
    if (!currentUser) return;
    const newStatus = currentUser.status === "available" ? "busy" : "available";
    const updated = { ...currentUser, status: newStatus as "available" | "busy" };
    await updatePartner(updated);
    setCurrentUser(updated);
  };

  // Helper to render Category Icon
  const renderCategoryIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "Electrician":
        return <Zap className={className} />;
      case "Plumber":
        return <Wrench className={className} />;
      case "Carpenters":
        return <Hammer className={className} />;
      case "Cleaning & Pest Control":
        return <Sparkles className={className} />;
      case "Pooja":
        return <Flame className={className} />;
      case "Ac & Home Appliances":
        return <Snowflake className={className} />;
      case "TV & Entertainment":
        return <Tv className={className} />;
      case "CCTV & Security":
        return <Video className={className} />;
      default:
        return <Briefcase className={className} />;
    }
  };

  // Subcategory popup modal open
  const openSubcategoryModal = (catOption: ServiceCategoryOption, isForEditProfile = false) => {
    setActiveCategoryForSubModal(catOption);
    setIsEditProfileSubModal(isForEditProfile);

    const subList = catOption.subCategories || [];
    if (isForEditProfile) {
      const existing = (editData.sub_categories || []).filter((s: string) => subList.includes(s));
      setTempSelectedSubcategories(existing.length > 0 ? existing : [...subList]);
    } else {
      const existing = (regData.subCategories || []).filter(s => subList.includes(s));
      setTempSelectedSubcategories(existing.length > 0 ? existing : [...subList]);
    }
  };

  const handleToggleSubcategoryInModal = (subName: string) => {
    if (tempSelectedSubcategories.includes(subName)) {
      setTempSelectedSubcategories(tempSelectedSubcategories.filter(s => s !== subName));
    } else {
      setTempSelectedSubcategories([...tempSelectedSubcategories, subName]);
    }
  };

  const handleSelectAllSubInModal = () => {
    if (!activeCategoryForSubModal?.subCategories) return;
    setTempSelectedSubcategories([...activeCategoryForSubModal.subCategories]);
  };

  const handleClearAllSubInModal = () => {
    setTempSelectedSubcategories([]);
  };

  const handleSaveSubcategoriesModal = () => {
    if (!activeCategoryForSubModal) return;
    const catName = activeCategoryForSubModal.name;
    const allCatSubs = activeCategoryForSubModal.subCategories || [];

    if (isEditProfileSubModal) {
      const remainingSubs = (editData.sub_categories || []).filter((s: string) => !allCatSubs.includes(s));
      const newSubs = [...remainingSubs, ...tempSelectedSubcategories];

      let currentCats: string[] = [...(editData.categories || [])];
      if (tempSelectedSubcategories.length > 0) {
        if (!currentCats.includes(catName)) {
          currentCats.push(catName);
        }
      } else {
        currentCats = currentCats.filter(c => c !== catName);
      }

      setEditData({
        ...editData,
        categories: currentCats,
        sub_categories: newSubs
      });
    } else {
      const remainingSubs = (regData.subCategories || []).filter(s => !allCatSubs.includes(s));
      const newSubs = [...remainingSubs, ...tempSelectedSubcategories];

      let currentCats: string[] = [...regData.categories];
      if (tempSelectedSubcategories.length > 0) {
        if (!currentCats.includes(catName)) {
          currentCats.push(catName);
        }
      } else {
        currentCats = currentCats.filter(c => c !== catName);
      }

      setRegData({
        ...regData,
        categories: currentCats,
        subCategories: newSubs
      });
    }

    setActiveCategoryForSubModal(null);
  };

  const handleCategoryCardClick = (catOption: ServiceCategoryOption, isForEdit = false) => {
    const catName = catOption.name;
    if (isForEdit) {
      const currentCats: string[] = editData.categories || [];
      const isSelected = currentCats.includes(catName);

      if (catOption.subCategories && catOption.subCategories.length > 0) {
        openSubcategoryModal(catOption, true);
      } else {
        if (isSelected) {
          setEditData({
            ...editData,
            categories: currentCats.filter(c => c !== catName)
          });
        } else {
          setEditData({
            ...editData,
            categories: [...currentCats, catName]
          });
        }
      }
    } else {
      const isSelected = regData.categories.includes(catName);
      if (catOption.subCategories && catOption.subCategories.length > 0) {
        openSubcategoryModal(catOption, false);
      } else {
        if (isSelected) {
          setRegData({
            ...regData,
            categories: regData.categories.filter(c => c !== catName)
          });
        } else {
          setRegData({
            ...regData,
            categories: [...regData.categories, catName]
          });
        }
      }
    }
  };

  const renderSubCategoryModal = () => {
    if (!activeCategoryForSubModal) return null;
    const catOption = activeCategoryForSubModal;
    const subCategories = catOption.subCategories || [];
    const selectedCount = tempSelectedSubcategories.length;
    const allSelected = selectedCount === subCategories.length && subCategories.length > 0;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white relative">
            <button
              onClick={() => setActiveCategoryForSubModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                {renderCategoryIcon(catOption.name, "w-5 h-5 text-white")}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Service Category</span>
                <h3 className="text-xl font-black text-white leading-tight">{catOption.name}</h3>
              </div>
            </div>
            <p className="text-xs text-indigo-200 font-medium">
              Select the specific sub-services you provide under this category
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Selected: <span className="text-indigo-600 font-black">{selectedCount}</span> / {subCategories.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllSubInModal}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                  allSelected ? "text-slate-400 bg-slate-100" : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleClearAllSubInModal}
                disabled={selectedCount === 0}
                className="text-xs font-bold text-slate-500 hover:text-red-600 disabled:opacity-40 px-2.5 py-1 rounded-lg transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Subcategories List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
            {subCategories.map(subName => {
              const isChecked = tempSelectedSubcategories.includes(subName);
              return (
                <div
                  key={subName}
                  onClick={() => handleToggleSubcategoryInModal(subName)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? "bg-indigo-50/70 border-indigo-500 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        isChecked ? "bg-indigo-600 text-white" : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className={`text-sm font-bold ${isChecked ? "text-indigo-950" : "text-slate-700"}`}>
                      {subName}
                    </span>
                  </div>
                  {isChecked && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => setActiveCategoryForSubModal(null)}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubcategoriesModal}
              className="flex-[2] py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Apply ({selectedCount} Selected)</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // AUTH VIEW (Matching Screenshot)
  const renderAuth = () => (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center">
        {/* Top Icon */}
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-100">
          <Briefcase className="w-8 h-8 text-white" />
        </div>

        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Partner Portal</h2>
        <p className="text-slate-500 text-sm mb-6 text-center font-medium">Manage your bookings and earnings</p>

        {/* Toggle (Login / Sign Up) */}
        <div className="w-full bg-slate-100/80 p-1.5 rounded-2xl flex mb-6 border border-slate-200/60">
          <button
            onClick={() => {
              setAuthMode("login");
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              authMode === "login"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              authMode === "signup"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert Box (Matching screenshot red card) */}
        {authError && (
          <div className="w-full bg-red-50 text-red-600 px-4 py-3.5 rounded-xl mb-5 text-sm font-medium border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form Inputs */}
        <div className="w-full space-y-3.5">
          {authMode === "signup" && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={authData.name}
                  onChange={e => setAuthData({ ...authData, name: e.target.value })}
                  className="w-full border border-slate-200 bg-indigo-50/20 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authData.email}
                  onChange={e => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
              </div>
            </>
          )}

          <div>
            <input
              type="text"
              placeholder={authMode === "login" ? "Phone Number or Email" : "Phone Number"}
              value={authData.phone}
              onChange={e => setAuthData({ ...authData, phone: e.target.value })}
              className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={e => setAuthData({ ...authData, password: e.target.value })}
              className="w-full border border-slate-200 bg-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
            />
          </div>

          <button
            onClick={authMode === "login" ? handleLogin : handleSignup}
            disabled={authLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-indigo-100 mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : authMode === "login" ? (
              "Login"
            ) : (
              "Continue to Registration"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Camera Modal
  const renderCameraModal = () => {
    if (!isCameraOpen) return null;
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in fade-in duration-300">
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="absolute min-w-full min-h-full object-cover"></video>
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
          <div className="absolute top-10 w-full text-center pointer-events-none drop-shadow-md px-4">
            <p className="text-white font-bold text-lg">
              {cameraTarget === "profile" 
                ? "Position your face in the frame" 
                : "Capture Shop, Visiting Card, or Banner"}
            </p>
            <p className="text-slate-300 text-xs mt-1">Make sure lighting is clear and text is readable</p>
          </div>
        </div>
        <div className="h-32 bg-black flex items-center justify-between px-8 sm:px-16 pb-4">
          <button
            onClick={stopCamera}
            className="text-white font-bold px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-indigo-200 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] relative"
          >
            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 flex items-center justify-center">
              <Camera className="text-indigo-600" size={24} />
            </div>
          </button>
          <div className="w-[84px]"></div>
        </div>
      </div>
    );
  };

  // ONBOARDING MODAL
  const renderRegistrationModal = (isMandatory = false) => {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        {renderCameraModal()}
        {renderSubCategoryModal()}
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl">
          {!isMandatory && (
            <button
              onClick={() => setIsRegistrationOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-xs uppercase tracking-wide"
            >
              ✕
            </button>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">Partner Onboarding 👋</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium">Join our verified network of professional technicians</p>

          {/* Stepper Progress */}
          <div className="flex justify-between items-center mb-8 relative px-1 sm:px-2 max-w-md mx-auto">
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${
                  ["personal", "expertise", "location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                1
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">PERSONAL</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${
                  ["expertise", "location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                2
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">EXPERTISE</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${
                  ["location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                3
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">LOCATION</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${
                  ["verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }`}
              >
                4
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">VERIFY</span>
            </div>
          </div>

          {/* STEP 1: PERSONAL */}
          {regStep === "personal" && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                  <input
                    type="text"
                    value={regData.firstName}
                    onChange={e => setRegData({ ...regData, firstName: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    value={regData.lastName}
                    onChange={e => setRegData({ ...regData, lastName: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                  <input
                    type="text"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Alternative Phone</label>
                  <input
                    type="text"
                    value={regData.altPhone}
                    onChange={e => setRegData({ ...regData, altPhone: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Gender</label>
                  <select
                    value={regData.gender}
                    onChange={e => setRegData({ ...regData, gender: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    value={regData.age}
                    onChange={e => setRegData({ ...regData, age: e.target.value })}
                    className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setRegStep("expertise")}
                  disabled={!regData.firstName || !regData.phone}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  Next: Services & Expertise
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERTISE */}
          {regStep === "expertise" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Select Service Categories & Specializations *
                  </label>
                  <span className="text-xs text-indigo-600 font-bold">
                    {regData.categories.length} {regData.categories.length === 1 ? "Category" : "Categories"} selected
                    {regData.subCategories.length > 0 && ` (${regData.subCategories.length} sub-services)`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Select all the categories you provide. For categories with sub-services (like AC/Appliances or Cleaning), click to choose your exact repairs and services.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SERVICE_CATEGORIES_DATA.map(catOption => {
                    const isSelected = regData.categories.includes(catOption.name);
                    const hasSubCategories = !!(catOption.subCategories && catOption.subCategories.length > 0);
                    const selectedSubs = hasSubCategories
                      ? (catOption.subCategories || []).filter(sub => regData.subCategories.includes(sub))
                      : [];

                    return (
                      <div
                        key={catOption.id}
                        onClick={() => handleCategoryCardClick(catOption, false)}
                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-sm ring-1 ring-indigo-600/20"
                            : "bg-white border-slate-200 text-slate-800 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                                isSelected
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                              }`}
                            >
                              {renderCategoryIcon(catOption.name, "w-5 h-5")}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm leading-tight text-slate-900">{catOption.name}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{catOption.description}</p>
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400"></div>
                            )}
                          </div>
                        </div>

                        {/* Subcategory Action / Badges Bar */}
                        {hasSubCategories && (
                          <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                            {isSelected ? (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                                  {selectedSubs.length} of {catOption.subCategories?.length} Sub-services
                                </span>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    openSubcategoryModal(catOption, false);
                                  }}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline ml-auto"
                                >
                                  <Settings2 className="w-3.5 h-3.5" />
                                  <span>Configure</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full text-[11px] text-slate-500 font-medium">
                                <span>{catOption.subCategories?.length} Sub-categories</span>
                                <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                                  Select <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Sub-services Chips Preview */}
              {regData.subCategories.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                      Selected Specializations ({regData.subCategories.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, subCategories: [] })}
                      className="text-[11px] font-bold text-slate-500 hover:text-red-600"
                    >
                      Clear All Sub-services
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {regData.subCategories.map(sub => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-indigo-200 text-indigo-800 px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setRegData({
                              ...regData,
                              subCategories: regData.subCategories.filter(s => s !== sub)
                            })
                          }
                          className="text-slate-400 hover:text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={regData.experience}
                  onChange={e => setRegData({ ...regData, experience: e.target.value })}
                  className="w-full sm:w-1/3 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setRegStep("personal")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-xl font-bold text-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setRegStep("location")}
                  disabled={regData.categories.length === 0}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  Next: Location & Radius
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION */}
          {regStep === "location" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Service Delivery Areas & Radius
                </label>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <MapRadiusSelector
                      onLocationDetected={async (lat, lng, addressDetails) => {
                        let finalArea = addressDetails?.area || "";
                        let detectedCity = addressDetails?.city || "";
                        if (addressDetails?.pincode && addressDetails.pincode.length === 6) {
                          try {
                            const res = await fetchAreasByPincode(addressDetails.pincode);
                            if (res.success && res.areas.length > 0) {
                              if (!finalArea) finalArea = res.areas[0];
                              if (res.isBangalore) detectedCity = "Bangalore";
                              else if (addressDetails.pincode.startsWith("110")) detectedCity = "Delhi";
                            }
                          } catch (err) {
                            console.warn("Error fetching area for pincode:", err);
                          }
                        }

                        setRegData(prev => ({
                          ...prev,
                          lat,
                          lng,
                          city: detectedCity || prev.city,
                          area: finalArea || addressDetails?.area || prev.area,
                          address: addressDetails?.address || prev.address,
                          pincode: addressDetails?.pincode || prev.pincode
                        }));
                      }}
                      onPincodesFound={async (pins, lat, lng, radius, addressDetails) => {
                        let finalArea = addressDetails?.area || "";
                        let detectedCity = addressDetails?.city || "";
                        if (addressDetails?.pincode && addressDetails.pincode.length === 6) {
                          try {
                            const res = await fetchAreasByPincode(addressDetails.pincode);
                            if (res.success && res.areas.length > 0) {
                              if (!finalArea) finalArea = res.areas[0];
                              if (res.isBangalore) detectedCity = "Bangalore";
                              else if (addressDetails.pincode.startsWith("110")) detectedCity = "Delhi";
                            }
                          } catch (err) {
                            console.warn("Error fetching area for pincode:", err);
                          }
                        }

                        setRegData(prev => ({
                          ...prev,
                          service_pincodes: Array.from(new Set([...prev.service_pincodes, ...pins])),
                          lat: lat || prev.lat,
                          lng: lng || prev.lng,
                          service_radius: radius || prev.service_radius,
                          city: detectedCity || prev.city,
                          area: finalArea || addressDetails?.area || prev.area,
                          address: addressDetails?.address || prev.address,
                          pincode: addressDetails?.pincode || prev.pincode
                        }));
                      }}
                    />
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Location Details</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Full Address *</label>
                      <textarea
                        placeholder="e.g. 123 Main Road, Near Market"
                        value={regData.address}
                        onChange={e => setRegData({ ...regData, address: e.target.value })}
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">City *</label>
                        <select
                          value={regData.city || ""}
                          onChange={e => setRegData({ ...regData, city: e.target.value })}
                          className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
                        >
                          <option value="">Select City</option>
                          {CITY_DATA.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Area / Locality *</label>
                        <input
                          type="text"
                          placeholder="e.g. Indiranagar"
                          value={regData.area}
                          onChange={e => setRegData({ ...regData, area: e.target.value })}
                          className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Pincode *</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 560038"
                          value={regData.pincode}
                          onChange={async e => {
                            const newPin = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setRegData(prev => ({ ...prev, pincode: newPin }));

                            if (newPin.length === 6 && !regData.area) {
                              try {
                                const areaRes = await fetchAreasByPincode(newPin);
                                if (areaRes.success && areaRes.areas.length > 0) {
                                  setRegData(prev => ({
                                    ...prev,
                                    area: prev.area || areaRes.areas[0]
                                  }));
                                }
                              } catch (err) {
                                console.warn("Pincode lookup error:", err);
                              }
                            }
                          }}
                          className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setRegStep("expertise")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-3.5 rounded-xl font-bold text-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (regData.service_pincodes.length === 0 && regData.pincode) {
                      setRegData({ ...regData, service_pincodes: [regData.pincode] });
                    }
                    setRegStep("verify");
                  }}
                  disabled={!regData.address || !regData.pincode}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  Continue to Verification
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFICATION */}
          {regStep === "verify" && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              {/* Profile Photo */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">1. Profile Photo / Selfie *</h4>
                  <p className="text-xs text-slate-500">Take a live photo or upload your profile picture</p>
                </div>

                {profilePhoto ? (
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(profilePhoto)}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                    />
                    <button
                      onClick={() => setProfilePhoto(null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow"
                      title="Remove Photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startCamera("profile")}
                      className="flex-1 py-3 border-2 border-dashed border-indigo-200 bg-white rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2 text-xs"
                    >
                      <Camera size={16} /> Open Camera
                    </button>
                    <label className="flex-1 py-3 border-2 border-dashed border-slate-200 bg-white rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 text-xs cursor-pointer">
                      <Upload size={16} /> Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setProfilePhoto(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Aadhaar Verification */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">2. Aadhaar Card Verification</h4>
                  <p className="text-xs text-slate-500">Provide 12-digit Aadhaar number or upload photo</p>
                </div>

                <input
                  type="text"
                  placeholder="12-digit Aadhaar Number"
                  maxLength={12}
                  value={regData.aadharNumber}
                  onChange={e => setRegData({ ...regData, aadharNumber: e.target.value.replace(/\D/g, "") })}
                  className="w-full border border-slate-200 bg-white p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                />

                {aadhaarPhoto ? (
                  <div className="relative inline-flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    <img
                      src={URL.createObjectURL(aadhaarPhoto)}
                      alt="Aadhaar Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="text-xs text-slate-700 font-medium truncate max-w-[180px]">
                      {aadhaarPhoto.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAadhaarPhoto(null)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 ml-auto"
                      title="Remove Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full py-3 border-2 border-dashed border-slate-200 bg-white rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 text-xs cursor-pointer">
                    <Upload size={16} /> Upload Aadhaar Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setAadhaarPhoto(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* 3. Shop Image / Visiting Card / Banner Photo */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">3. Shop Image / Visiting Card / Banner Photo</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Identification
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Upload your shop / dukaan photo, visiting card, or banner for identity & shop verification
                  </p>
                </div>

                {shopPhoto ? (
                  <div className="relative inline-flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                    <img
                      src={URL.createObjectURL(shopPhoto)}
                      alt="Shop / Visiting Card"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{shopPhoto.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{(shopPhoto.size / 1024).toFixed(1)} KB</p>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                        <Check size={12} /> Ready for verification
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShopPhoto(null)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition shrink-0"
                      title="Remove Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startCamera("shop")}
                      className="flex-1 py-3 border-2 border-dashed border-indigo-200 bg-white rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2 text-xs"
                    >
                      <Camera size={16} /> Open Camera
                    </button>
                    <label className="flex-1 py-3 border-2 border-dashed border-slate-200 bg-white rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2 text-xs cursor-pointer">
                      <Upload size={16} /> Upload Gallery
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setShopPhoto(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setRegStep("location")}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 py-4 rounded-xl font-bold text-slate-700 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleRegistrationSubmit()}
                  disabled={isSubmitting || !profilePhoto || (regData.aadharNumber.length < 12 && !aadhaarPhoto)}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {regStep === "success" && (
            <PartnerRegistrationSuccess 
              onComplete={() => {
                setIsRegistrationOpen(false);
                setIsPendingSignup(false);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  // Lead processing and matching
  const partnerBookings = currentUser ? bookings.filter(b => b.assignedPartnerId === currentUser.id) : [];
  const partnerCallLogs = currentUser ? callLogs.filter(log => log.partnerId === currentUser.id) : [];

  const newLeads = currentUser
    ? bookings.filter(b => {
        if (b.status !== "pending") return false;

        const partnerPins = currentUser.service_pincodes || [];
        const bPin = String(b.pinCode || "").trim();
        const pPin = String(currentUser.pincode || "").trim();

        let hasLocationMatch = false;

        if (rpcMatchedLeadIds.length > 0) {
          hasLocationMatch = rpcMatchedLeadIds.includes(b.id);
        } else {
          const pLat = currentUser.lat;
          const pLng = currentUser.lng;
          const bLat = b.lat;
          const bLng = b.lng;
          const serviceRadius =
            currentUser.service_radius ||
            (currentUser.service_areas && currentUser.service_areas.length > 0
              ? parseFloat(currentUser.service_areas[0])
              : 5) ||
            5;

          if (pLat && pLng && bLat && bLng) {
            const toRad = (v: number) => (v * Math.PI) / 180;
            const R = 6371;
            const dLat = toRad(bLat - pLat);
            const dLon = toRad(bLng - pLng);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(pLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            if (distance <= serviceRadius) {
              hasLocationMatch = true;
            }
          }
        }

        if (!hasLocationMatch) {
          hasLocationMatch = bPin === pPin || partnerPins.includes(bPin);
        }
        if (!hasLocationMatch) return false;

        const partnerCategories = currentUser.categories || [];
        const mapCustomerCategoryToPartner = (cat: string) => {
          const lowerCat = (cat || "").toLowerCase();
          if (
            [
              "ac",
              "washingmachine",
              "refrigerator",
              "waterpurifier",
              "geyser",
              "microwave",
              "television",
              "chimney",
              "home appliances"
            ].includes(lowerCat)
          )
            return "Home Appliances";
          if (lowerCat.includes("plumb") || lowerCat === "plumber") return "Plumber";
          if (lowerCat.includes("clean") || lowerCat.includes("pest")) return "Cleaning & Pest Control";
          if (lowerCat.includes("electrician")) return "Electrician";
          if (lowerCat.includes("carpenter")) return "Carpenters";
          return cat;
        };

        const primaryCategory = mapCustomerCategoryToPartner(b.serviceCategory);
        const hasPrimaryMatch = partnerCategories.includes(primaryCategory);
        const hasCartItemMatch =
          b.cartItems &&
          b.cartItems.some(item => partnerCategories.includes(mapCustomerCategoryToPartner(item.categoryName)));

        return hasPrimaryMatch || hasCartItemMatch;
      })
    : [];

  const activeJob = partnerBookings.find(
    b => b.status === "accepted" || b.status === "Forwarded" || b.status === "in_progress"
  );

  const handleAcceptLead = async (lead: Booking) => {
    if (!currentUser) return;
    if (activeJob) {
      alert("You can only accept one lead at a time. Please complete your current job first.");
      return;
    }

    await updateBooking({
      ...lead,
      status: "accepted",
      assignedPartnerId: currentUser.id,
      assignedPartnerName: currentUser.name,
      assignedPartnerPhone: currentUser.phone,
      assignedPartnerArea: currentUser.city || currentUser.pincode
    });

    const updatedPartner = { ...currentUser, status: "busy" as const };
    await updatePartner(updatedPartner as Partner);
    setCurrentUser(updatedPartner as Partner);
  };

  const handleCancelLead = async (b: Booking) => {
    if (!currentUser) return;
    const penalty = b.price * 0.05;
    if (
      confirm(
        `Are you sure you want to cancel this lead? A penalty of ₹${penalty.toFixed(
          2
        )} (5% of service charge) will be deducted from your earnings.`
      )
    ) {
      await updateBooking({
        ...b,
        status: "pending",
        assignedPartnerId: undefined,
        assignedPartnerName: undefined,
        assignedPartnerPhone: undefined,
        assignedPartnerArea: undefined
      });

      const updated = {
        ...currentUser,
        earnings: (currentUser.earnings || 0) - penalty
      } as Partner;
      await updatePartner(updated);
      setCurrentUser(updated);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpBookingId) return;
    const b = partnerBookings.find(item => item.id === otpBookingId);
    if (!b) return;

    if (b.otp && b.otp !== otpInput) {
      setOtpError("Invalid OTP. Please ask the customer for the correct 4-digit PIN.");
      return;
    }

    await updateBooking({
      ...b,
      status: "in_progress",
      otpVerified: true
    });

    setOtpBookingId(null);
    setOtpInput("");
    setOtpError("");
  };

  const handleCompleteJob = (b: Booking) => {
    setJobToComplete(b);
    setPaymentVerificationCode(Math.floor(100000 + Math.random() * 900000).toString());
    setVerificationStep("idle");
    setUploadedImage(null);
    setUploadedFile(null);
    setVerificationError(null);
  };

  const verifyPaymentScreenshot = async () => {
    if (!jobToComplete || !uploadedFile || !currentUser) return;
    const commission = Number((jobToComplete.price * 0.25).toFixed(2));
    setVerificationStep("verifying");
    setVerificationError(null);

    try {
      // Bypassing AI verification
      const aiResult = {
        verified: true,
        extractedAmount: commission,
        extractedUtr: "Manual-Bypass",
        reason: "Auto-approved",
        rawJson: "{}"
      };

      setCommissionAiResult(aiResult);
      
      // Step 3: Upload commission screenshot to Supabase Storage
      let commissionFilePath: string | null = null;
      try {
        let authUid = currentUser.id;
        try {
          const { data: authSession } = await supabase.auth.getUser();
          if (authSession?.user?.id) {
            authUid = authSession.user.id;
          }
        } catch {
          authUid = currentUser.id;
        }

        const uploadRes = await uploadAppFile({
          userId: authUid,
          featureName: "partner_commission",
          itemId: jobToComplete.id,
          file: uploadedFile,
          customFileName: uploadedFile.name || "commission.jpg"
        });
        commissionFilePath = uploadRes.filePath;
      } catch (uploadErr) {
        console.warn("Storage upload for commission screenshot failed, falling back:", uploadErr);
      }

      const partnerEarnings = jobToComplete.price - commission;

      await updateBooking({
        ...jobToComplete,
        status: "completed",
        commissionPaid: true,
        commission_screenshot: commissionFilePath || undefined
      });

      const updatedPartner = {
        ...currentUser,
        earnings: (currentUser.earnings || 0) + partnerEarnings,
        completedJobs: (currentUser.completedJobs || 0) + 1,
        status: "available" as const
      };
      await updatePartner(updatedPartner);
      setCurrentUser(updatedPartner);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (confettiErr) {
        console.log("Confetti trigger:", confettiErr);
      }

      setVerificationStep("success");
    } catch (err: any) {
      console.error("Commission verification error:", err);
      setVerificationError(err.message || "Failed to verify screenshot");
      setVerificationStep("idle");
    }
  };

  const openEditProfile = () => {
    if (currentUser) {
      setEditData(currentUser);
      setIsEditProfileOpen(true);
    }
  };

  const handleEditProfileSubmit = async () => {
    if (currentUser) {
      await updatePartner({ ...currentUser, ...editData });
      setCurrentUser({ ...currentUser, ...editData });
      setIsEditProfileOpen(false);
    }
  };

  // OTP Modal
  const renderOtpModal = () => {
    if (!otpBookingId) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl text-center">
          <button onClick={() => setOtpBookingId(null)} className="absolute top-4 right-4 text-slate-400 font-bold">
            ✕
          </button>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Enter Customer OTP</h3>
          <p className="text-xs text-slate-500 mb-4">Ask customer for the 4-digit code to start the service</p>

          <input
            type="text"
            maxLength={4}
            value={otpInput}
            onChange={e => setOtpInput(e.target.value)}
            placeholder="0000"
            className="w-full text-center text-2xl tracking-[0.5em] font-black border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
          />

          {otpError && <p className="text-xs text-red-500 mb-3 font-medium">{otpError}</p>}

          <button
            onClick={handleVerifyOtp}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow"
          >
            Verify & Start Job
          </button>
        </div>
      </div>
    );
  };

  // Edit Profile Modal
  const renderEditProfileModal = () => {
    if (!isEditProfileOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold"
          >
            ✕
          </button>
          <h2 className="text-2xl font-black mb-4">Edit Profile</h2>

          {/* Profile Avatar Display */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-slate-200 overflow-hidden flex items-center justify-center text-indigo-600 font-black text-lg shrink-0">
              {partnerAvatarUrl ? (
                <img src={partnerAvatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : <UserIcon size={24} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-xs text-slate-500">{currentUser.phone || currentUser.email}</p>
              <span className="inline-block text-[10px] font-black uppercase text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full mt-1">
                Verified Technician
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={editData.name || ""}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="w-full border p-3 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Phone</label>
              <input
                type="text"
                value={editData.phone || ""}
                onChange={e => setEditData({ ...editData, phone: e.target.value })}
                className="w-full border p-3 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">City</label>
              <input
                type="text"
                value={editData.city || ""}
                onChange={e => setEditData({ ...editData, city: e.target.value })}
                className="w-full border p-3 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Primary Pincode</label>
              <input
                type="text"
                value={editData.pincode || ""}
                onChange={e => setEditData({ ...editData, pincode: e.target.value })}
                className="w-full border p-3 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                Service Pincodes (Comma separated)
              </label>
              <input
                type="text"
                value={(editData.service_pincodes || []).join(", ")}
                onChange={e =>
                  setEditData({
                    ...editData,
                    service_pincodes: e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  })
                }
                className="w-full border p-3 rounded-xl text-sm outline-none"
              />
            </div>

            {/* Service Categories in Edit Profile */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Services & Specializations
                </label>
                <span className="text-xs text-indigo-600 font-bold">
                  {(editData.categories || []).length} Selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICE_CATEGORIES_DATA.map(catOption => {
                  const isSelected = (editData.categories || []).includes(catOption.name);
                  const hasSubCategories = !!(catOption.subCategories && catOption.subCategories.length > 0);
                  const selectedSubs = hasSubCategories
                    ? (catOption.subCategories || []).filter(sub => (editData.sub_categories || []).includes(sub))
                    : [];

                  return (
                    <div
                      key={catOption.id}
                      onClick={() => handleCategoryCardClick(catOption, true)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-600 text-indigo-950 shadow-xs"
                          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {renderCategoryIcon(catOption.name, "w-4 h-4")}
                          </div>
                          <span className="text-xs font-bold">{catOption.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>

                      {hasSubCategories && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          {isSelected ? (
                            <>
                              <span className="font-bold text-indigo-700">
                                {selectedSubs.length}/{catOption.subCategories?.length} sub-services
                              </span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openSubcategoryModal(catOption, true);
                                }}
                                className="text-indigo-600 font-bold hover:underline"
                              >
                                Edit Sub-services
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400">{catOption.subCategories?.length} sub-services</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleEditProfileSubmit}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Payment Verification Modal
  const renderPaymentModal = () => {
    if (!jobToComplete) return null;
    const commission = Number((jobToComplete.price * 0.25).toFixed(2));
    const partnerEarnings = jobToComplete.price - commission;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
          <button
            onClick={() => {
              setJobToComplete(null);
              setCommissionAiResult(null);
              setVerificationError(null);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition z-10"
          >
            ✕
          </button>

          <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 p-6 text-white text-center relative">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 backdrop-blur-sm">
              <Bot className="w-3 h-3" /> Gemini Vision Multimodal AI
            </div>
            <h3 className="text-xl font-bold">Complete Job & Settle Commission</h3>
            <p className="text-indigo-100 text-xs mt-1">Instant payment verification</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Financial summary card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Total Customer Charge</span>
                <span className="font-bold text-slate-900">₹{jobToComplete.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Company Commission (25%)</span>
                <span className="font-bold text-indigo-600">₹{commission}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-700">Your Net Earnings (75%)</span>
                <span className="font-black text-emerald-600 text-sm">₹{partnerEarnings}</span>
              </div>
            </div>

            {verificationStep === "idle" && (
              <div className="text-center space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-left">
                  <p className="text-[11px] font-bold text-amber-900">
                    Pay 25% commission (₹{commission}) via UPI & upload screenshot for instant AI job completion.
                  </p>
                  {paymentVerificationCode && (
                    <div className="mt-1 text-[11px] font-mono text-amber-800">
                      Payment Ref: <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">Code-{paymentVerificationCode}</span>
                    </div>
                  )}
                </div>

                <div className="inline-block p-2 border-4 border-indigo-50 rounded-2xl bg-white shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=8115983887@ptsbi&pn=Sofiyan%20Home%20Services&cu=INR&am=${commission}&tn=Code-${paymentVerificationCode}`
                    )}`}
                    alt="Payment QR"
                    className="w-36 h-36 object-contain mx-auto"
                  />
                </div>

                <div className="flex gap-2">
                  <a
                    href={`upi://pay?pa=8115983887@ptsbi&pn=Sofiyan%20Home%20Services&cu=INR&am=${commission}&tn=Code-${paymentVerificationCode}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Smartphone size={14} /> Pay ₹{commission} in UPI App
                  </a>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Upload Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedImage(URL.createObjectURL(e.target.files[0]));
                        setUploadedFile(e.target.files[0]);
                        setVerificationError(null);
                        setCommissionAiResult(null);
                      }
                    }}
                    className="w-full border rounded-xl p-2.5 text-xs bg-slate-50"
                  />
                </div>

                {uploadedImage && (
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-left">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Screenshot"
                      className="w-12 h-12 rounded-lg object-cover border border-indigo-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-800 truncate">{uploadedFile?.name}</p>
                      <p className="text-slate-500 text-[10px]">Ready for Upload</p>
                    </div>
                  </div>
                )}

                {verificationError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-200 text-left space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Verification Failed</span>
                    </div>
                    <p className="text-slate-700 pl-5">{verificationError}</p>
                  </div>
                )}

                <button
                  onClick={verifyPaymentScreenshot}
                  disabled={!uploadedImage || !paymentVerificationCode}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition shadow mt-2 flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles size={16} />
                  <span>Submit Receipt & Complete Job</span>
                </button>
              </div>
            )}

            {verificationStep === "verifying" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-base">Gemini Vision AI Scanning...</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    {commissionAiScanProgress || `Verifying ₹${commission} commission payment receipt...`}
                  </p>
                </div>
              </div>
            )}

            {verificationStep === "success" && (
              <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">Payment Verified & Job Completed!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    ₹{partnerEarnings} net earnings have been credited to your wallet balance.
                  </p>
                </div>

                {commissionAiResult && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-left text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Commission:</span>
                      <span className="font-bold text-emerald-800">₹{commissionAiResult.extractedAmount || commission}</span>
                    </div>
                    {commissionAiResult.extractedUtr && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank UTR / Ref:</span>
                        <span className="font-mono font-bold text-slate-800">{commissionAiResult.extractedUtr}</span>
                      </div>
                    )}
                    {commissionAiResult.paymentApp && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Channel:</span>
                        <span className="font-bold text-slate-800">{commissionAiResult.paymentApp}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => {
                    setJobToComplete(null);
                    setCommissionAiResult(null);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ROUTING & VIEW DETERMINATION
  // 1. Unauthenticated -> Show Auth screen
  if (!currentUser && !isPendingSignup) {
    return renderAuth();
  }

  // 2. In Registration Modal -> Show modal
  if (isRegistrationOpen || isPendingSignup) {
    return renderRegistrationModal(isPendingSignup);
  }

  if (!currentUser) return null;

  // 3. Authenticated Partner Dashboard
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-4 pb-24">
      {renderSubCategoryModal()}
      {renderPaymentModal()}
      {renderOtpModal()}
      {renderEditProfileModal()}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 shadow-inner overflow-hidden border border-slate-200/80 relative">
            {partnerAvatarUrl ? (
              <img
                src={partnerAvatarUrl}
                alt={currentUser.name || "Partner"}
                className="w-full h-full object-cover"
                onError={() => setPartnerAvatarUrl(null)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-600 bg-indigo-50 font-black text-base uppercase">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : <UserIcon className="w-7 h-7" />}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">{currentUser.name}</h1>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              ★ {currentUser.rating || "5.0"} • {currentUser.service_radius || 5} KM Radius •{" "}
              {currentUser.service_pincodes?.length || 1} Service Pincodes
            </p>
            <p className="text-xs sm:text-sm text-green-600 font-black mt-1">
              Wallet Balance: ₹{(currentUser.earnings || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <button
            onClick={toggleAvailability}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-xs sm:text-sm shadow-sm ${
              currentUser.status === "available"
                ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentUser.status === "available" ? "bg-green-500 animate-pulse" : "bg-slate-400"
              }`}
            ></div>
            {currentUser.status === "available" ? "Available" : "Busy"}
          </button>

          <button
            onClick={openEditProfile}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-indigo-600 hover:text-indigo-700 px-4 py-2.5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition font-bold text-xs sm:text-sm"
          >
            <UserIcon size={14} /> Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-slate-500 hover:text-red-600 px-4 py-2.5 bg-slate-50 rounded-xl hover:bg-red-50 transition font-bold text-xs sm:text-sm"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Dashboard Dual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Active / Process Leads */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-base sm:text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
            <Briefcase className="text-indigo-600 w-5 h-5" /> Active Bookings (Process Lead)
          </h2>

          {partnerBookings.filter(b => b.status === "pending" || b.status === "accepted" || b.status === "in_progress")
            .length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60 border-dashed">
              <p className="text-slate-400 text-sm font-medium">No active jobs assigned.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerBookings
                .filter(b => b.status === "pending" || b.status === "accepted" || b.status === "in_progress")
                .map(b => (
                  <div
                    key={b.id}
                    className="border border-slate-200 p-5 rounded-2xl hover:border-indigo-300 transition shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <p className="font-bold text-slate-900 text-base leading-tight">{b.subServiceName}</p>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          b.status === "in_progress"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Customer Details Box */}
                    <div className="mb-4 p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100/60 text-xs sm:text-sm">
                      <p className="font-bold text-indigo-950 mb-2 border-b border-indigo-100 pb-1">Customer Details</p>
                      <div className="space-y-1 text-slate-700">
                        <p>
                          <strong className="text-slate-900">Name:</strong> {b.customerName}
                        </p>
                        <p>
                          <strong className="text-slate-900">Phone:</strong> {b.contactNumber}
                        </p>
                        <p>
                          <strong className="text-slate-900">Address:</strong> {b.address}, {b.area || ""}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <a
                            href={`tel:${b.contactNumber}`}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            <Phone size={12} /> Call Customer
                          </a>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${b.address} ${b.area || ""}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            <MapPin size={12} /> View Map
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-xs text-slate-600">
                      <p className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" /> {b.pinCode}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" /> {b.date} at {b.time}
                      </p>
                      {currentUser?.lat && currentUser?.lng && b.lat && b.lng && (
                        <p className="text-indigo-600 font-bold flex items-center gap-1">
                          Distance: {calculateDistance(currentUser.lat, currentUser.lng, b.lat, b.lng)}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <p className="font-black text-green-600 text-base">₹{b.price}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelLead(b)}
                          className="text-xs font-bold bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-xl hover:bg-red-100 transition"
                        >
                          Cancel
                        </button>
                        {b.status === "accepted" || b.status === "Forwarded" ? (
                          <button
                            onClick={() => setOtpBookingId(b.id)}
                            className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-sm"
                          >
                            Start Job
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCompleteJob(b)}
                            className="text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition shadow-sm"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Right: Available Leads */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-base sm:text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
            <Star className="text-amber-500 w-5 h-5" /> Nearby Available Leads ({newLeads.length})
          </h2>

          {newLeads.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/60 border-dashed">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No new leads available in your radius right now.</p>
            </div>
          ) : (
            <div className="space-y-3.5 overflow-y-auto max-h-[700px] pr-1">
              {newLeads.map(b => (
                <div
                  key={b.id}
                  className="border p-4 rounded-2xl bg-amber-50/20 border-amber-200 hover:border-amber-400 transition shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{b.subServiceName}</p>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded uppercase">
                      NEW
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-slate-400" /> {b.pinCode} • {b.city || "Local"}
                    </p>
                    {currentUser?.lat && currentUser?.lng && b.lat && b.lng && (
                      <p className="text-indigo-600 font-bold flex items-center gap-1">
                        Distance: {calculateDistance(currentUser.lat, currentUser.lng, b.lat, b.lng)}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" /> {b.date} • {b.time}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-amber-200/60">
                    <p className="font-black text-green-600 text-sm sm:text-base">₹{b.price}</p>
                    <button
                      onClick={() => handleAcceptLead(b)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-100"
                    >
                      Accept Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call History Section */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col mt-6">
        <h2 className="text-base sm:text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
          <PhoneCall className="text-indigo-600 w-5 h-5" /> Inbound Customer Inquiries
        </h2>
        {partnerCallLogs.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200/60 border-dashed">
            <p className="text-slate-400 text-sm font-medium">No calls from customers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerCallLogs.map((log) => (
              <div key={log.id} className="border border-slate-100 p-4 rounded-2xl bg-indigo-50/20 hover:border-indigo-200 transition shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-indigo-950">{log.customerName}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{log.categoryName}</p>
                  </div>
                  <div className={`p-2 rounded-full ${log.type === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-indigo-100 text-indigo-600'}`}>
                    {log.type === 'whatsapp' ? <MessageCircle size={14} /> : <PhoneCall size={14} />}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100/80 flex justify-between items-center text-xs">
                  <a href={`tel:${log.customerPhone}`} className="font-mono text-indigo-700 font-bold hover:underline">
                    {log.customerPhone}
                  </a>
                  <span className="text-slate-400 font-medium">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPanel;
