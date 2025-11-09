import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUpdateProfileMutation } from "@/store/api/userApi";
import { useAppSelector, useAppDispatch } from "@/hooks/useReducer";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { Edit } from "lucide-react";

const ProfileSection = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profile, setProfile] = useState(user?.profile || "");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  // ✅ Update local state when user changes in store
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      setProfile(user.profile || "");
    }
  }, [user]);

  // 📸 Handle image selection + preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  // 🧾 Handle text input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("name", formData.name);
      if (file) data.append("profile", file);
      const updatedUser = await updateProfile(data).unwrap();
      dispatch(setUser(updatedUser.data.user));
      toast.success("Profile updated");
      if (preview) setProfile(preview);
      setPreview(null);
      setFile(null);
    } catch (err: any) {
      toast.error("Update failed");
    }
  };

  return (
    <main className="flex-1 p-8 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between gap-3 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold">
              My Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Manage your personal information and account settings.
            </p>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark rounded-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-start gap-4">
                  <div className="relative group cursor-pointer">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-32 h-32 border"
                      style={{
                        backgroundImage: `url(${preview || profile})`,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white">
                          <Edit />
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-gray-900 dark:text-white text-xl font-bold">
                      {formData.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-base">
                      {formData.email}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="md:col-span-2">
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <Label
                        htmlFor="name"
                        className="text-gray-800 dark:text-gray-200 text-sm font-medium pb-2"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-background-light dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-visible:ring-primary/20"
                      />
                    </div>

                    <div className="flex flex-col">
                      <Label
                        htmlFor="email"
                        className="text-gray-800 dark:text-gray-200 text-sm font-medium pb-2"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ProfileSection;
