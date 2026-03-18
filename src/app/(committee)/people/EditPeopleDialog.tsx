"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField} from "@radix-ui/themes";
import {isPerson, IPerson} from "@/interfaces/ICommittee";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {INSERT_PEOPLE_ENDPOINT, UPDATE_PEOPLE_ENDPOINT} from "@/lib/endpoints";
import Image from "next/image";

export default function EditCommitteeDialog({
  key,
  person,
  onSuccess,
  children
} : {
  key?: number,
  person?: IPerson,
  onSuccess?: () => void,
  children?: ReactNode
}) {
  const initial_form_data: IPerson | Omit<IPerson, 'id'> = person ?? {
      name: "",
      course: "",
      description: "",
      fact: "",
      song: "",
      photo: ""
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
          if (!person) {
            response = await fetch(INSERT_PEOPLE_ENDPOINT, {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              }
            });
          } else {
            response = await fetch(UPDATE_PEOPLE_ENDPOINT(person.id), {
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
            if (person)
              toast.showToast("Success", `Updated person with ID: ${body.updated_id}`);
            else
              toast.showToast("Success", `Added person with ID: ${body.id}`);
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
          <Dialog.Title>{person? "Edit Person": "New Person"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Edit data about committe members.
          </Dialog.Description>

          <form action={dispatch}>
            <Flex direction="column" gap="3">
              {isPerson(form) &&
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
                  Name*
                </Text>
                <TextField.Root
                    name="name"
                    disabled={isPending}
                    value={form.name}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          name: x.target.value
                        })}
                    placeholder="Enter the person's name"
                    required
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Course
                </Text>
                <TextField.Root
                    name="course"
                    disabled={isPending}
                    value={form.course}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          course: x.target.value
                        })}
                    placeholder="Enter the person's course"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Fact
                </Text>
                <TextArea
                    name="fact"
                    disabled={isPending}
                    value={form.fact}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          fact: x.target.value
                        })}
                    placeholder="Enter the person's fact"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Song
                </Text>
                <TextField.Root
                    name="song"
                    disabled={isPending}
                    value={form.song}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          song: x.target.value
                        })}
                    placeholder="Enter the song id from spotify"
                />
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
                          src={"https://api.burnfm.com/uploads/committee_img/" + encodeURIComponent(photoPreview)}
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
                Save committee member
                <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}