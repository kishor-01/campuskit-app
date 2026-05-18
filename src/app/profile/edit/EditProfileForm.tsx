// src/app/profile/edit/EditProfileForm.tsx
"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/actions/userActions";
import { Camera, Lock, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
    >
      {pending ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
      ) : (
        <Save className="w-4 h-4 mr-2" />
      )}
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

export default function EditProfileForm({ user }: { user: any }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError({ _form: ["Invalid file type. Use JPEG, PNG, WebP, or GIF."] });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError({ _form: ["Image must be under 5MB."] });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function action(formData: FormData) {
    setMessage("");
    setError(null);

    // Upload avatar first if selected
    if (avatarFile) {
      setUploading(true);
      try {
        const uploadData = new FormData();
        uploadData.append("avatar", avatarFile);
        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: uploadData,
        });
        const json = await res.json();
        if (!res.ok) {
          setError({ _form: [json.error || "Avatar upload failed."] });
          setUploading(false);
          return;
        }
        // Avatar saved, clear local state
        setAvatarFile(null);
        setAvatarPreview(null);
      } catch {
        setError({ _form: ["Avatar upload failed. Please try again."] });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Then update the rest of the profile
    const res = await updateProfile(null, formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.message) {
      setMessage(res.message);
      router.refresh();
    }
  }


  return (
    <form action={action} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Profile Photo
        </label>
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              {avatarPreview ? (
                /* Native img for instant blob: URL preview */
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : user.image ? (
                <Image
                  src={user.image}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            {/* Hover overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {avatarFile ? "Change Photo" : "Upload Photo"}
            </button>
            {avatarFile && (
              <button
                type="button"
                onClick={clearAvatar}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP or GIF. Max 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Locked Email Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center">
          Email
          <span className="ml-2 text-muted-foreground cursor-help" title="Managed via Google OAuth">
            <Lock className="w-3 h-3" />
          </span>
        </label>
        <div className="w-full p-2 bg-muted/30 text-muted-foreground rounded-md border border-border text-sm flex items-center h-10">
          {user.email || "No email"}
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">Display Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name || ""}
            placeholder="John Doe"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          {error?.name && <p className="text-sm text-red-500">{error.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio || ""}
            placeholder="Tell us about yourself..."
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {error?.bio && <p className="text-sm text-red-500">{error.bio[0]}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="githubUrl" className="text-sm font-medium text-foreground">GitHub URL</label>
            <input
              id="githubUrl"
              name="githubUrl"
              type="url"
              defaultValue={user.githubUrl || ""}
              placeholder="https://github.com/username"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {error?.githubUrl && <p className="text-sm text-red-500">{error.githubUrl[0]}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="portfolioUrl" className="text-sm font-medium text-foreground">Portfolio URL</label>
            <input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              defaultValue={user.portfolioUrl || ""}
              placeholder="https://yourwebsite.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {error?.portfolioUrl && <p className="text-sm text-red-500">{error.portfolioUrl[0]}</p>}
          </div>
        </div>
      </div>

      {error?._form && (
        <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
          {error._form.join(", ")}
        </div>
      )}

      {message && (
        <div className="p-3 rounded bg-green-50 text-green-600 text-sm border border-green-200">
          {message}
        </div>
      )}

      {uploading && (
        <div className="p-3 rounded bg-blue-50 text-blue-600 text-sm border border-blue-200 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
          Uploading avatar...
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
