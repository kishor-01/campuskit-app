// /src/app/submit-resource/SubmitResourcePageClient.tsx

'use client'

import { useActionState, useEffect, useRef, useState } from 'react';
import { Category } from '@prisma/client';
import { submitResource } from '@/actions';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useFormStatus } from 'react-dom';

interface FormState {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting Resource...
        </>
      ) : (
        'Submit Resource'
      )}
    </button>
  );
}

export default function SubmitResourcePageClient({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(submitResource, {
    message: null,
    error: null,
    success: false
  });
  
  const formRef = useRef<HTMLFormElement>(null);
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  useEffect(() => {
    if (state?.success && state?.message) {
      toast.success(state.message);
      formRef.current?.reset();
      setUrl('');
    }
    
    if (state?.error && !state.success) {
      const errorMessages = typeof state.error === 'string' 
        ? [state.error]
        : state.error && typeof state.error === 'object'
        ? Object.values(state.error).flat()
        : ["Failed to submit resource"];
      
      toast.error(errorMessages.join('\n'));
    }
  }, [state]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (value) validateUrl(value);
  };

  const getFieldError = (fieldName: string): string | undefined => {
    if (state?.error && typeof state.error === 'object' && state.error[fieldName]) {
      const fieldErrors = state.error[fieldName];
      return Array.isArray(fieldErrors) ? fieldErrors[0] : undefined;
    }
    return undefined;
  };

  // Explicit type casting for aria-invalid
  const getAriaInvalid = (hasError: boolean): boolean | undefined => {
    return hasError ? true : undefined;
  };

  // Special case for URL field that has both validation and error state
  const getUrlAriaInvalid = (): boolean | undefined => {
    const hasFieldError = !!getFieldError('url');
    const hasValidationError = url ? !isValidUrl : false;
    return (hasFieldError || hasValidationError) ? true : undefined;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/resources" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Submit a Resource
            </h1>
            <p className="text-muted-foreground">
              Share valuable learning resources with the community. All submissions will be reviewed before publishing.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <form
            ref={formRef}
            action={formAction}
            className="space-y-6"
          >
            {/* Resource Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Resource Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g., React Official Documentation"
                className="w-full p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                aria-invalid={getAriaInvalid(!!getFieldError('name'))}
                aria-describedby="name-error"
              />
              {getFieldError('name') && (
                <p id="name-error" className="text-sm text-destructive mt-1">
                  {getFieldError('name')}
                </p>
              )}
            </div>

            {/* Resource URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                Resource URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={url}
                  onChange={handleUrlChange}
                  required
                  placeholder="https://example.com/resource"
                  className={`w-full p-3 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all pr-10 ${
                    url && !isValidUrl ? 'border-destructive' : 'border-input'
                  }`}
                  aria-invalid={getUrlAriaInvalid()}
                  aria-describedby="url-error"
                />
                {url && isValidUrl && (
                  <ExternalLink className="absolute right-3 top-3 w-4 h-4 text-green-600" />
                )}
              </div>
              {url && !isValidUrl && (
                <p className="text-sm text-destructive mt-1">
                  Please enter a valid URL
                </p>
              )}
              {getFieldError('url') && (
                <p id="url-error" className="text-sm text-destructive mt-1">
                  {getFieldError('url')}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                className="w-full p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                aria-invalid={getAriaInvalid(!!getFieldError('categoryId'))}
                aria-describedby="category-error"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {getFieldError('categoryId') && (
                <p id="category-error" className="text-sm text-destructive mt-1">
                  {getFieldError('categoryId')}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                aria-invalid={getAriaInvalid(!!getFieldError('imageUrl'))}
                aria-describedby="imageUrl-error"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a cover image for better visibility (optional)
              </p>
              {getFieldError('imageUrl') && (
                <p id="imageUrl-error" className="text-sm text-destructive mt-1">
                  {getFieldError('imageUrl')}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe what this resource is about, what learners can expect, and why it's valuable..."
                className="w-full p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-vertical"
                aria-invalid={getAriaInvalid(!!getFieldError('description'))}
                aria-describedby="description-error"
              />
              {getFieldError('description') && (
                <p id="description-error" className="text-sm text-destructive mt-1">
                  {getFieldError('description')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 10 characters. Be descriptive and helpful for other learners.
              </p>
            </div>

            {/* Submit Button */}
            <SubmitButton />

            {/* General Form Errors */}
            {state?.error && typeof state.error === 'string' && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive text-center">
                  {state.error}
                </p>
              </div>
            )}
          </form>

          {/* Submission Guidelines */}
          <div className="mt-8 p-4 bg-muted/50 rounded-md border border-border">
            <h3 className="font-semibold text-foreground mb-2">
              Submission Guidelines
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure the resource is educational and high-quality</li>
              <li>• Provide accurate and helpful descriptions</li>
              <li>• Choose the most relevant category</li>
              <li>• Free resources are preferred but not required</li>
              <li>• No spam, affiliate links, or low-quality content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}