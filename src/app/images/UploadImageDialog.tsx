"use client";

import { useToast } from "@/app/components/Toast";
import { IImage, isImage } from "@/interfaces/IImage";
import { UPLOAD_IMAGE_ENDPOINT, GET_SHOW_IMAGES_ENDPOINT, GET_PODCAST_IMAGES_ENDPOINT, GET_PEOPLE_IMAGES_ENDPOINT } from "@/lib/endpoints";
import {
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  Kbd,
  Text,
  TextArea,
  TextField
} from "@radix-ui/themes";
import Image from "next/image";
import { ReactNode, useActionState, useEffect, useState } from "react";

export default function UploadImageDialog({
  onSuccess,
  children,
  defaultUse = "Shows"
}: {
  onSuccess?: () => void;
  children?: ReactNode;
  defaultUse?: string;
}) {
  type UploadFormData = Omit<IImage, "id" | "use"> & {
    use: string | null;
    image: File | null;
  };

  const initial_form_data: UploadFormData = {
    name: "",
    location: "",
    use: defaultUse.toLowerCase() === "all" ? null : defaultUse,
    image: null,
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data);
  const toast = useToast();

  const fetchImages = async () => {
    try {
      const [showResponse, podcastResponse, peopleResponse] = await Promise.all([
            fetch(GET_SHOW_IMAGES_ENDPOINT),
            fetch(GET_PODCAST_IMAGES_ENDPOINT),
            fetch(GET_PEOPLE_IMAGES_ENDPOINT)
        ]);

        if (!showResponse.ok || !podcastResponse.ok || !peopleResponse.ok) {
            throw new Error("Failed to fetch images");
        }

        const [showImages, podcastImages, peopleImages] = await Promise.all([
            showResponse.json() as Promise<string[]>,
            podcastResponse.json() as Promise<string[]>,
            peopleResponse.json() as Promise<string[]>
        ]);

        const images: IImage[] = [
            ...showImages.map((image) => ({
                name: image,
                location: `https://api.burnfm.com/uploads/show_img/${encodeURIComponent(image)}`,
                use: "show"
            })),
            ...podcastImages.map((image) => ({
                name: image,
                location: `https://api.burnfm.com/uploads/podcast_img/${encodeURIComponent(image)}`,
                use: "podcast"
            })),
            ...peopleImages.map((image) => ({
                name: image,
                location: `https://api.burnfm.com/uploads/committee_img/${encodeURIComponent(image)}`,
                use: "committee"
            }))
        ];
    
      return images;

    } catch (error) {
        console.error(error);
        throw error;
    }
  };

  const validateFile = async (selectedFile: File): Promise<boolean> => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.showToast(
        "Invalid image",
        "Only JPEG, PNG and WebP images are supported.",
      );
      return false;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.showToast(
        "Image too large",
        "Images must be smaller than 5 MB.",
      );
      return false;
    }

    const images = await fetchImages();

    const duplicate = images.some((image) => image.name.toLowerCase() === selectedFile.name.toLowerCase());

    if (duplicate) {
      toast.showToast(
        "Image already exists",
        `An image named "${selectedFile.name}" already exists in ${form.use}.`,
      );
      return false;
    }

    return true;
  };

  const [state, dispatch, isPending] = useActionState(
    async (previousState: null, payload: FormData) => {
      try {

        if (!form.use) {
          toast.showToast("No use selected", "Please select what this image will be used for.");
          return null;
        }

        const selectedFile = payload.get("image");
        if (!(selectedFile instanceof File) || selectedFile.size === 0) {
          toast.showToast("No image selected", "Please select an image.");
          return null;
        }

        if (!(await validateFile(selectedFile))) {return null;}

        let response;
        response = await fetch(`${UPLOAD_IMAGE_ENDPOINT}?use=${form.use.toLocaleLowerCase()}`, {
          method: "POST",
          body: payload, // For form-data type don't include Content-Type in header, otherwise issues
          headers: {
            Authorization: `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          },
        });

        if (response.ok) {
          if (onSuccess) onSuccess();
          setOpen(false);
          toast.showToast("Success", `Uploaded image`);
          return null;
        } else {
          toast.showToast(
            "An error occurred",
            `${response.status} Error: ${response.statusText}`,
          );
          return null;
        }
      } catch (e) {
        console.log(e);
        toast.showToast(
          "An error occurred",
          "An unexpected error occurred. Please refresh the page or try again later.",
        );
        return null;
      }
    },
    null,
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!(await validateFile(selectedFile))) {
      event.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: selectedFile.name,
      image: selectedFile,
    }));
  };


  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        use: defaultUse.toLowerCase() === "all" ? null : defaultUse,
      }));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Upload Image</Dialog.Title>

        <form action={dispatch}>
          <Flex direction="column" gap="3">

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Use*
              </Text>
              <Flex direction="column">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" style={{ width: "max-content" }}>
                      {form.use ? form.use.charAt(0).toUpperCase() + form.use.slice(1) : "Select a use"}
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      key="Shows"
                      onSelect={() => setForm({ ...form, use: 'Shows' })}
                    >
                      Shows
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      key="Podcasts"
                      onSelect={() => setForm({ ...form, use: 'Podcasts' })}
                    >
                      Podcasts
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      key="Committees"
                      onSelect={() => setForm({ ...form, use: 'Committees' })}
                    >
                      Committees
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>

              {/* IMPORTANT: this is what gets submitted */}
              <input type="hidden" name="type" value={form.use ?? ""} />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Image*
              </Text>
              <Button
                type="button"
                variant="soft"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={isPending}
              >
                Choose Image
              </Button>
              <input
                id="image-upload"
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isPending}
                required
                style={{ display: "none" }}
              />
              <Text as="div" size="1" color="gray" mt="1">
                JPEG, PNG or WebP. Maximum size 5 MB.
              </Text>

              {form.image && (
                <Flex
                  direction="column"
                  align="center"
                  gap="2"
                >
                    <Image
                      src={URL.createObjectURL(form.image)}
                      alt="Selected image preview"
                      width={150}
                      height={150}
                      unoptimized
                      style={{
                        objectFit: "contain",
                        maxWidth: "100%",
                        height: "150px",
                      }}
                    />
                  <Text size="2" weight="medium">
                    {form.name}
                  </Text>

                  <Text size="2" weight="medium">
                      {(form.image.size / 1024 / 1024).toFixed(2)} MB
                  </Text>

                  <Button
                    type="button"
                    variant="soft"
                    color="red"
                    onClick={() => setForm({ ...form, image: null})}
                    disabled={isPending}
                  >
                    Remove image
                  </Button>
                </Flex>
              )}
              
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isPending}>
                Discard
                <Kbd
                  style={{
                    background: "rgba(255,255,255, 0.1)",
                    boxShadow: "none",
                  }}
                >
                  Esc
                </Kbd>
              </Button>
            </Dialog.Close>
            <Button type={"submit"} loading={isPending}>
              Upload Image
              <Kbd
                style={{
                  background: "rgba(255,255,255, 0.1)",
                  boxShadow: "none",
                }}
              >
                Enter ⏎
              </Kbd>
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
