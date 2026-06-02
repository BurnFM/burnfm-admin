"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField, DropdownMenu} from "@radix-ui/themes";
import {isShow, IShow} from "@/interfaces/IShow";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {INSERT_RADIOSHOW_ENDPOINT, UPDATE_RADIOSHOW_ENDPOINT, GET_SHOW_IMAGES_ENDPOINT} from "@/lib/endpoints";
import Image from "next/image";

export default function EditShowDialog({
  key,
  show,
  onSuccess,
  children
} : {
  key?: number,
  show?: IShow,
  onSuccess?: () => void,
  children?: ReactNode
}) {
  const initial_form_data: IShow | Omit<IShow, 'id'> = show ?? {
      title: "",
      description: "",
      hosts: [],
      photo: ""
  }

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data)
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(GET_SHOW_IMAGES_ENDPOINT,{
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
        );
        const data = await res.json(); // assuming it returns JSON array

        setImages(data);
      } catch (err) {
        console.error("Failed to fetch images", err);
      }
    }

    fetchImages();
  }, []);
  const toast = useToast();

  // Define form action and state variables
  const [state, dispatch, isPending] = useActionState(
      async (previousState: null, payload: FormData) => {
        try {
          let response;
          if (!show) {
            response = await fetch(INSERT_RADIOSHOW_ENDPOINT, {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              }
            });
          } else {
            response = await fetch(UPDATE_RADIOSHOW_ENDPOINT(show.id), {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              }
            });
          }

          if (response.ok) {
            if (onSuccess) onSuccess();
            setOpen(false);
            const body = await response.json();
            console.log(body)
            if (show)
              toast.showToast("Success", `Updated show with ID: ${body.updated_id}`);
            else
              toast.showToast("Success", `Added show with ID: ${body.id}`);
            return null;
          } else {
            toast.showToast("An error occurred", `${response.status} Error: ${response.statusText}`);
            return null;
          }
        } catch (e) {
          console.log(e)
          toast.showToast("An error occurred", "An unexpected error occurred. Please refresh the page or try again later.");
          return null;
        }
      },
      null
);

  // const handleFileDrop = (acceptedFiles, fileRejections: FileRejection[]) => {
  //   if (fileRejections.length) {
  //     console.log(fileRejections);
  //     setFile({file: null, error: "File selection rejected"});
  //     return;
  //   }  // TODO check to ensure only png, jpg and webp files are allowed through
  //   setFile({
  //     file: Object.assign(acceptedFiles[0], {
  //       preview: URL.createObjectURL(acceptedFiles[0])
  //     }),
  //     error: null
  //   });
  // }

  // const removeFile = async () => {
  //   await delay(50);
  //   setFile({file: null, error: null});  // TODO handle removing from formdata too
  // }

  return (
      <Dialog.Root key={key} open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          { children }
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title>{show? "Edit Radio Show": "New Radio Show"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Define your show here. To change where it appears in the schedule,
            go to <Link asChild>
              <NextLink href="/scheduling">Scheduling</NextLink>
            </Link>.
          </Dialog.Description>

          <form action={dispatch}>
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Title*
                </Text>
                <TextField.Root
                    name="title"
                    disabled={isPending}
                    value={form.title}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          title: x.target.value
                        })}
                    placeholder="Enter the show's name"
                    required
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Description
                </Text>
                <TextArea
                    name="description"
                    disabled={isPending}
                    value={form.description}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          description: x.target.value
                        })}
                    placeholder="Enter the show's description"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Hosts
                </Text>
                <TextField.Root
                    name="hosts"
                    disabled={isPending}
                    value={form.hosts.toString()}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          hosts: x.target.value.split(",")
                        })}
                    placeholder="Enter the host(s) of the show, split by commas"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Photo
                </Text>
                <Flex direction="column" align="center">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="soft" style={{ width: "max-content" }}>
                        {form.photo || "Select an image"}
                        <DropdownMenu.TriggerIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        key="none"
                        onSelect={() => setForm({ ...form, photo: '' })}
                      >
                        No image
                      </DropdownMenu.Item>
                      {images.map((image) => (
                        <DropdownMenu.Item
                          key={image}
                          onSelect={() => {
                            setForm({
                              ...form,
                              photo: image,
                            });
                          }}
                        >
                          {image}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>

                {/* IMPORTANT: this is what gets submitted */}
                <input type="hidden" name="photo" value={form.photo ?? undefined} />
              </label>

              {
                <Flex direction="column" align="center">
                  {form.photo ? (
                    <Image
                      src={"https://api.burnfm.com/uploads/schedule_img/" + encodeURIComponent(form.photo)}
                      alt=""
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div></div>
                  )}
                </Flex>
              }

              {/*<label>*/}
              {/*  <Flex direction="column">*/}
              {/*    <Text as="div" size="2" mb="1" weight="bold">*/}
              {/*      Photo*/}
              {/*    </Text>*/}
              {/*    {file.file ?*/}
              {/*        <Button onClick={removeFile} variant="outline" color="gray" style={{padding: "30px"}}>*/}
              {/*          <Image src={file.file.preview} width={40} height={40} alt={"Attached image preview"} style={{*/}
              {/*            objectFit: "cover",*/}
              {/*            borderRadius: "var(--radius-2)",*/}
              {/*          }} />*/}
              {/*          <Text weight="regular">Click to remove</Text>*/}
              {/*        </Button>*/}
              {/*    :*/}
              {/*        <Dropzone onDrop={handleFileDrop} accept={{'image/*': ['.jpeg', '.png', '.webp']}} maxFiles={1}>*/}
              {/*          {({getRootProps, getInputProps, isDragActive}) => (*/}
              {/*              <Button asChild variant="outline" color="gray" style={{padding: "30px"}}>*/}
              {/*                <button {...getRootProps()}>*/}
              {/*                  <input name="photo" {...getInputProps()} />*/}
              {/*                  <Text weight="regular">{isDragActive ? "Drop photo here" : "Drag and drop photo here"}</Text>*/}
              {/*                </button>*/}
              {/*              </Button>*/}
              {/*          )}*/}
              {/*        </Dropzone>*/}
              {/*    }*/}
              {/*  </Flex>*/}
              {/*</label>*/}

              {/*{state &&*/}
              {/*    <Callout.Root color="crimson" role="alert">*/}
              {/*        <Callout.Icon>*/}
              {/*            <ExclamationTriangleIcon/>*/}
              {/*        </Callout.Icon>*/}
              {/*        <Callout.Text>*/}
              {/*          {state}*/}
              {/*        </Callout.Text>*/}
              {/*    </Callout.Root>*/}
              {/*}*/}

              {/*{file.error &&*/}
              {/*    <Callout.Root color="crimson" role="alert">*/}
              {/*        <Callout.Icon>*/}
              {/*            <ExclamationTriangleIcon />*/}
              {/*        </Callout.Icon>*/}
              {/*        <Callout.Text>*/}
              {/*          {file.error}*/}
              {/*        </Callout.Text>*/}
              {/*    </Callout.Root>*/}
              {/*}*/}
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" disabled={isPending}>
                  Discard
                  <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Esc</Kbd>
                </Button>
              </Dialog.Close>
              <Button type={"submit"} loading={isPending}>
                Save Show
                <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}