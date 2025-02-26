import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Plus, Eye, EyeOff, Key } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { fetchJapaneseAddress } from "../../services/addressService";
import { countries } from "../../utils/countries";
import { createClientSchema } from "../../utils/clientValidation";
import axios from "axios";
import toast from "react-hot-toast";

const categories = [
  "Visit Visa Applicant",
  "Japan Visit Visa Applicant",
  "Document Translation",
  "Student Visa Applicant",
  "Epassport Applicant",
  "Japan Visa",
  "Graphic Design & Printing",
  "Web Design & Seo",
  "Birth Registration",
  "Documentation Support",
  "Other",
];

const optionalCategories = [
  "Document Translation",
  "Epassport Applicant",
  "Japan Visa",
];

const contactModes = ["Direct Call", "Viber", "WhatsApp", "Facebook Messenger"];

export default function AddClientModal({ isOpen, onClose, getAllClients }) {
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createClientSchema(selectedCategory)),
    defaultValues: {
      facebookUrl: "",
      status: "active",
      category: "",
      address: {
        postalCode: "",
        prefecture: "",
        city: "",
        street: "",
        building: "",
      },
      modeOfContact: [],
      password: "",
    },
  });

  const postalCode = watch("address.postalCode");
  const selectedModes = watch("modeOfContact");

  // Fetch address based on postal code
  const handlePostalCodeChange = useCallback(async () => {
    if (!postalCode || optionalCategories.includes(selectedCategory)) return;
    const cleanPostalCode = postalCode.replace(/\D/g, "");

    if (cleanPostalCode.length !== 7) return;

    setIsAddressLoading(true);
    setAddressError(null);

    try {
      const address = await fetchJapaneseAddress(cleanPostalCode);
      if (address) {
        setValue("address.prefecture", address.prefecture);
        setValue("address.city", address.city);
        setValue("address.street", address.town);
      } else {
        setAddressError("No address found for this postal code");
        setValue("address.prefecture", "");
        setValue("address.city", "");
        setValue("address.street", "");
      }
    } catch (error) {
      setAddressError("Failed to fetch address");
      console.error("Address fetch error:", error);
    } finally {
      setIsAddressLoading(false);
    }
  }, [postalCode, selectedCategory, setValue]);

  // Handle file upload and preview
  const handleFileChange = (event) => {
    const fileList = event.target.files;
    if (!fileList?.length) return;

    const file = fileList[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
      setFiles(fileList);
    };
    reader.readAsDataURL(file);
  };

  // Toggle contact mode
  const toggleContactMode = (mode) => {
    const currentModes = selectedModes || [];
    setValue(
      "modeOfContact",
      currentModes.includes(mode)
        ? currentModes.filter((m) => m !== mode)
        : [...currentModes, mode]
    );
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const toastId = toast.loading("Creating client...");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "address") {
          Object.entries(value).forEach(([addrKey, addrValue]) => {
            formData.append(`address[${addrKey}]`, addrValue);
          });
        } else if (key === "modeOfContact") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      if (files?.length) {
        formData.append("profilePhoto", files[0]);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/createClient`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success(
          `Client created!\nUsername: ${data.email}\nPassword: ${data.password}`,
          { duration: 5000 }
        );
        getAllClients();
        handleClose();
      } else {
        throw new Error(response.data.message || "Failed to create client");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create client. Please try again."
      );
      console.error("Submission error:", error);
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Reset form on close
  const handleClose = () => {
    reset();
    setFiles(null);
    setProfilePhotoPreview(null);
    setSelectedCategory("");
    setAddressError(null);
    onClose();
  };

  // Trigger postal code lookup
  useEffect(() => {
    handlePostalCodeChange();
  }, [postalCode, handlePostalCodeChange]);

  if (!isOpen) return null;

  const isOptionalCategory = optionalCategories.includes(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Add New Client</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <label className="relative w-32 h-32 cursor-pointer">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover border-4 border-brand-yellow"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="absolute bottom-0 right-0 bg-brand-yellow rounded-full p-2">
                <Upload className="h-4 w-4 text-white" />
              </span>
            </label>
            <p className="text-sm text-gray-500">Upload profile photo (Optional)</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" {...register("name")} error={errors.name?.message} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register("category")}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setValue("password", "zoom2025")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Key className="h-4 w-4" />
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <Input label="Phone" type="tel" {...register("phone")} error={errors.phone?.message} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-md border-gray-300 focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <select
                {...register("nationality")}
                className="w-full rounded-md border-gray-300 focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option value="">Select nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-sm text-red-600">{errors.nationality.message}</p>
              )}
            </div>
            <Input
              label="Facebook Profile URL (Optional)"
              {...register("facebookUrl")}
              error={errors.facebookUrl?.message}
            />
          </div>

          {/* Address */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-lg mb-4">
              Address {isOptionalCategory && <span className="text-gray-500">(Optional)</span>}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Postal Code"
                {...register("address.postalCode")}
                placeholder="123-4567"
                className="md:col-span-2"
                disabled={isAddressLoading}
                error={errors.address?.postalCode?.message || addressError}
              />
              <Input
                label="Prefecture"
                {...register("address.prefecture")}
                disabled={isAddressLoading}
                error={errors.address?.prefecture?.message}
              />
              <Input
                label="City"
                {...register("address.city")}
                disabled={isAddressLoading}
                error={errors.address?.city?.message}
              />
              <Input
                label="Street"
                {...register("address.street")}
                disabled={isAddressLoading}
                className="md:col-span-2"
                error={errors.address?.street?.message}
              />
              <Input
                label="Building & Apartment"
                {...register("address.building")}
                placeholder="Building name, Floor, Unit number"
                className="md:col-span-2"
                error={errors.address?.building?.message}
              />
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-lg mb-4">Contact Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contactModes.map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModes?.includes(mode)}
                    onChange={() => toggleContactMode(mode)}
                    className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}