import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Plus, Eye, EyeOff, Key } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { fetchJapaneseAddress } from "../../services/addressService";
import { countries } from "../../utils/countries";
import { createClientSchema } from "../../utils/clientValidation";
import type { ClientCategory } from "../../types";
import axios from "axios";
import toast from "react-hot-toast";

const categories: ClientCategory[] = [
  "Visit Visa Applicant",
  "Japan Visit Visa Applicant",
  "Document Translation",
  "Student Visa Applicant",
  "Epassport Applicant",
  "Japan Visa",
  'Graphic Design & Printing',
   'Web Design & Seo',
   'Birth Registration',
   'Documentation Support',
   'Other'
];

const optionalCategories: ClientCategory[] = [
  "Document Translation",
  "Epassport Applicant",
  "Japan Visa",
];

interface AddClientModalProps {
  isOpen: boolean;
  getAllClients: () => void;
  onClose: () => void;
}

export default function AddClientModal({
  isOpen,
  onClose,
  getAllClients,
}: AddClientModalProps) {
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory>();
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientSchema(selectedCategory)),
    defaultValues: {
      facebookUrl: "",
      status: "active",
      category: selectedCategory,
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

  const handlePostalCodeChange = useCallback(async () => {
    if (!postalCode || optionalCategories.includes(selectedCategory)) return;

    const cleanPostalCode = postalCode.replace(/\D/g, "");

    setAddressError(null);

    if (cleanPostalCode.length === 7) {
      setIsAddressLoading(true);
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
        setAddressError("Failed to fetch address. Please try again.");
        console.error("Failed to fetch address:", error);
      } finally {
        setIsAddressLoading(false);
      }
    }
  }, [postalCode, setValue, selectedCategory]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList[0]) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePhotoPreview(base64String);
        setValue("profilePhoto", base64String);
      };
      reader.readAsDataURL(file);
      setFiles(fileList);
    }
  };

  const handleModeOfContactChange = (mode: string) => {
    const currentModes = watch("modeOfContact");
    if (currentModes.includes(mode)) {
      setValue(
        "modeOfContact",
        currentModes.filter((m) => m !== mode)
      );
    } else {
      setValue("modeOfContact", [...currentModes, mode]);
    }
  };

  const handleCategoryChange = (category: ClientCategory) => {
    setSelectedCategory(category);
    reset({
      ...watch(),
      category,
    });
  };

  const onSubmit = async (data: any) => {
    if (files) {
      const isFileTooLarge = Array.from(files).some(
        (file: File) => file.size > 2 * 1024 * 1024
      );
      if (isFileTooLarge) {
        setError("Please upload a file smaller than 2MB.");
        setProfilePhotoPreview(null);
        return;
      }
    }

    const toastId = toast.loading("Please wait, Photo is uploading...");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("status", data.status);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      formData.append("nationality", data.nationality);
      formData.append("postalCode", data.address.postalCode);
      formData.append("prefecture", data.address.prefecture);
      formData.append("city", data.address.city);
      formData.append("street", data.address.street);
      formData.append("building", data.address.building);
      formData.append("facebookUrl", data.facebookUrl || "");
      formData.append("modeOfContact", JSON.stringify(data.modeOfContact));
      formData.append("timeline", JSON.stringify(data.address.timeline || []));

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("profilePhoto", files[i]);
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/createClient`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success(
          `Client account created!\n\nUsername: ${data.email}\nPassword: ${data.password}\n\nPlease save these credentials and share them with the client securely.`
        );
        getAllClients();
        reset();
        setFiles(null);
        setProfilePhotoPreview(null);
        onClose();
      } else {
        toast.error(
          response.data.message || "Something went wrong. Please try again."
        );
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(
          error?.response?.data?.message || "Error occurred, please try again."
        );
      } else {
        toast.error("Network error, please try again.");
      }
    } finally {
      toast.dismiss(toastId);
    }
  };

  if (!isOpen) return null;

  const isOptionalCategory = optionalCategories.includes(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative w-32 h-32">
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
              <label className="absolute bottom-0 right-0 bg-brand-yellow rounded-full p-2 cursor-pointer hover:bg-yellow-500 transition-colors">
                <Upload className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <p className="text-sm text-gray-500">Upload profile photo (Optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input {...register("name")} className="w-full" />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register("category")}
                onChange={(e) => handleCategoryChange(e.target.value as ClientCategory)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option>Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input {...register("email")} type="email" className="w-full" />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setValue("password", "zoom2025")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Generate Password"
                >
                  <Key className="h-4 w-4" />
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <Input {...register("phone")} type="tel" className="w-full" />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <select
                {...register("nationality")}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
              >
                <option value="">Select nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>{country.name}</option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-sm text-red-600">{errors.nationality.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Facebook Profile URL <span className="text-gray-500">(Optional)</span>
              </label>
              <Input {...register("facebookUrl")} className="w-full" />
              {errors.facebookUrl && (
                <p className="text-sm text-red-600">{errors.facebookUrl.message as string}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="font-medium text-lg mb-6">Address {isOptionalCategory && <span className="text-gray-500">(Optional)</span>}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <div className="relative">
                  <Input
                    {...register("address.postalCode")}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formatted = value
                        .replace(/\D/g, "")
                        .replace(/^(\d{3})(\d{0,4})/, "$1-$2")
                        .substring(0, 8);
                      setValue("address.postalCode", formatted);
                      if (value.replace(/\D/g, "").length === 7) {
                        handlePostalCodeChange();
                      }
                    }}
                    placeholder="123-4567"
                    className="w-full"
                  />
                  {isAddressLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-yellow border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {addressError && <p className="text-sm text-red-600">{addressError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                <Input {...register("address.prefecture")} disabled={isAddressLoading} className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <Input {...register("address.city")} disabled={isAddressLoading} className="w-full" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <Input {...register("address.street")} disabled={isAddressLoading} className="w-full" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Building & Apartment</label>
                <Input
                  {...register("address.building")}
                  placeholder="Building name, Floor, Unit number"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="font-medium text-lg mb-6">Contact Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["Direct Call", "Viber", "WhatsApp", "Facebook Messenger"].map((mode) => (
                <label key={mode} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModes.includes(mode)}
                    onChange={() => handleModeOfContactChange(mode)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
