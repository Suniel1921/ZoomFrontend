import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { generateStrongPassword } from "../../utils/passwordGenerator";
import toast from "react-hot-toast";

const createClientSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
  nationality: z.string().min(1, "Nationality is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CreateClientFormData = z.infer<typeof createClientSchema>;

interface CreateClientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateClientAccountModal({
  isOpen,
  onClose,
}: CreateClientAccountModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
  });

  const handleGeneratePassword = () => {
    const password = generateStrongPassword();
    setValue("password", password);
    setValue("confirmPassword", password);
  };

  const onSubmit = async (data: CreateClientFormData) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/register`,{
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        nationality: data.nationality,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        onClose();
      }
    } catch (error:any) {
      if(error.response){
        toast.error(error.response.data.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Client Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <Input {...register("name")} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input {...register("email")} type="email" className="mt-1" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <Input {...register("phone")} type="tel" className="mt-1" />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          {/* Nationality Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <Input {...register("nationality")} className="mt-1" />
            {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
