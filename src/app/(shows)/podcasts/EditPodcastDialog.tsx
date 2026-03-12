"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField} from "@radix-ui/themes";
import {isPodcast, Ipodcast} from "@/interfaces/IPodcast";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {INSERT_PODCAST_ENDPOINT, UPDATE_PODCAST_ENDPOINT} from "@/lib/endpoints";
import Image from "next/image";

export default function EditPodcastDialog({
  key,
  podcast,
  onSuccess,
  children
} : {
  key?: number,
  podcast?: Ipodcast,
  onSuccess?: () => void,
  children?: ReactNode
}) {
  const initial_form_data: Ipodcast | Omit<Ipodcast, 'id'> = podcast ?? {
      title: "",
      description: "",
      hosts: [],
      photo: "",
      startDate: "",
      endDate: "",
  }

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data)
  const [photoPreview, setPhotoPreview] = useState(form.photo);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhotoPreview(form.photo);
    }, 1000); // wait 1sec after typing stops

    return () => clearTimeout(timeout);
  }, [form.photo]);

  const toast = useToast();

  // Define form action and state variables
  const [state, dispatch, isPending] = useActionState(
      async (previousState: null, payload: FormData) => {
        try {
          let response;
          if (!podcast) {
            response = await fetch(INSERT_PODCAST_ENDPOINT, {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              } 
            });
          } else {
            response = await fetch(UPDATE_PODCAST_ENDPOINT(podcast.id), {
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
            if (podcast)
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
          <Dialog.Title>{podcast? "Edit Podcast": "New Porcast"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Define your podcast here.
          </Dialog.Description>

          <form action={dispatch}>
            <Flex direction="column" gap="3">
              {isPodcast(form) &&
                  <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                          ID*
                      </Text>
                      <TextField.Root
                          name="id"
                          disabled
                          value={form.id}
                      />
                  </label>
              }
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
                    placeholder="Enter the podcast's name"
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
                    placeholder="Enter the podcast's description"
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
                    placeholder="Enter the host(s) of the podcast, split by commas"
                />
              </label>
              <label>
                <div style={{display:"flex"}}>
                  <Text as="div" size="2" mb="1" weight="bold" style={{width:"50%", textAlign:"center"}}>
                    Start Date
                  </Text>
                  <Text as="div" size="2" mb="1" weight="bold" style={{width:"50%", textAlign:"center"}}>
                    End Date
                  </Text>
                </div>
                <div style={{display:"flex", justifyContent:"space-evenly"}}>
                  <TextField.Root type="date"
                    name="startDate"
                    disabled={isPending}
                    value={form.startDate}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          startDate: x.target.value
                    })}
                    style={{width:"fit-content"}}
                  />
                  <TextField.Root type="date"
                    name="endDate"
                    disabled={isPending}
                    value={form.endDate}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          endDate: x.target.value
                    })}
                    style={{width:"fit-content"}}
                  />
                </div>
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Photo
                </Text>
                <TextField.Root
                    name="photo"
                    disabled={isPending}
                    value={form.photo}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          photo: x.target.value
                        })}
                    placeholder="Enter the photo's file path"
                />
              </label>

              {
                <Flex direction="column" align="center">
                  {form.photo ? (

                    photoPreview ? (
                        <Image
                          src={"https://api.burnfm.com/uploads/podcast_img/" + encodeURIComponent(photoPreview)}
                          alt=""
                          width={100}
                          height={100}
                        />
                      ) : null

                  ) : (<div></div>)}
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
                Save Podcast
                <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}