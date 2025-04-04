
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ImageUpload from "../../components/ImageUpload";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthGlobally } from "../../context/AuthContext";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  timeZone: z.string().min(1, "Time zone is required"),
  language: z.string().min(1, "Language is required"),
  profilePhoto: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [auth] = useAuthGlobally();
  console.log("profile url is", profilePhoto);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  // console.log(profilePhoto)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth?.user?.id) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${
            auth.user.id
          }`
        );
        const profile = response.data.data;
        console.log("profile data is", profile);
        setValue("name", profile.name);
        setValue("email", profile.email);

        // Ensure the profile photo URL is passed correctly
        setProfilePhoto(profile.superAdminPhoto || ""); // Set default if not available
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [auth?.user?.id, setValue]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePhoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setProfilePhoto(undefined);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!auth?.user?.id) return;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("timeZone", data.timeZone);
    formData.append("language", data.language);

    if (profilePhoto) {
      // Check if the photo is a base64 string (uploaded image) or a URL (profile image from DB)
      if (profilePhoto.startsWith("data:image")) {
        // If it's a base64 string, convert to file and append it
        const blob = await fetch(profilePhoto).then((res) => res.blob());
        formData.append("superAdminPhoto", blob, "profilePhoto.jpg");
      } else {
        // If it's an existing URL (no upload), send it as it is
        formData.append("superAdminPhoto", profilePhoto);
      }
    }

    try {
      toast.loading("Please wait, uploading photo...");
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/updateSuperAdmin/${
          auth.user.id
        }`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      toast.success("Profile Updated Successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Error updating profile");
    } finally {
      toast.dismiss(); // Dismiss the loading toast when done
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Profile Information
      </h3>

      {isSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <ImageUpload
            currentImage={profilePhoto}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input {...register("email")} type="email" className="mt-1" />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time Zone
            </label>
            <select
              {...register("timeZone")}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            >
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+09:00)</option>
              <option value="America/New_York">
                America/New_York (UTC-05:00)
              </option>
              <option value="Europe/London">Europe/London (UTC+00:00)</option>
            </select>
            {errors.timeZone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.timeZone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              {...register("language")}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="ne">Nepali</option>
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">
                {errors.language.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Update Changes</Button>
        </div>
      </form>
    </div>
  );
}
