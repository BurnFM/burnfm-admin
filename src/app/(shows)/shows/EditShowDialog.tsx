"use client"

import {Button, Callout, Dialog, Flex, Kbd, Link, Text, TextArea, TextField} from "@radix-ui/themes";
import {isShow, Show, Show_Partial} from "@/lib/show";
import {useActionState, useState} from "react";
import NextLink from "next/link";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import {useToast} from "@/app/components/Toast";

export default function EditShowDialog({
  show,
  onSuccess,
  children
} : {
  show?: Show,
  onSuccess?: () => void,
  children?: React.ReactNode
}) {

  const toast = useToast();

  const [open, setOpen] = useState(false);
  // const [file, setFile] = useState<{file: object|null, error: null|string}>({file: null, error: null});
  // const delay = async (milliseconds) => new Promise(resolve => {
  //     setTimeout(resolve, milliseconds);
  // })

  const initial_form_data: {
    error: null | string,
    show: Show | Show_Partial
  } = {
    error: null,
    show: show ?? {
      title: "",
      description: "",
      hosts: "",
      photo: ""
    } as Show_Partial
  }

  // Define form action and state variables
  const [state, dispatch, isPending] = useActionState(
      async (previousState, payload: FormData) => {
        try {
          let response;
          if (!show) {
            response = await fetch("api/radio_show", {
              method: "PUT",
              headers: {
                "Accept": "application/json",
                // "Content-Type": "multipart/form-data",
              },
              body: payload
            });
          } else {
            response = await fetch(`api/radio_show/${show.id}`, {
              method: "POST",
              headers: {
                "Accept": "application/json",
                // "Content-Type": "multipart/form-data",
              },
              body: payload
            });
          }

          if (response.ok) {
            if (onSuccess) onSuccess();
            setOpen(false);
            const body = await response.json();
            toast.showToast(`Added show`, "");
            return {...previousState, id: body.id};
          } else {
            toast.showToast("An error occurred", `${response.status} Error: ${response.statusText}`);
            return previousState;
          }
        } catch (error) {
          toast.showToast("An error occurred", "An unexpected error occurred. Please refresh the page or try again later.");
          return previousState;
        }
      },
      initial_form_data
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
      <Dialog.Root open={open} onOpenChange={setOpen}>
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
              {isShow(state.show) &&
                  <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                          Title
                      </Text>
                      <TextField.Root
                          name="title"
                          disabled
                          value={state.show.id}
                      />
                  </label>
              }
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Title
                </Text>
                <TextField.Root
                    name="title"
                    disabled={isPending}
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
                    placeholder="Enter the host(s) of the show, split by commas"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Photo
                </Text>
                <TextField.Root
                    name="photo"
                    disabled={isPending}
                    placeholder="Enter the photo's file path"
                />
              </label>

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

              {state.error &&
                  <Callout.Root color="crimson" role="alert">
                      <Callout.Icon>
                          <ExclamationTriangleIcon/>
                      </Callout.Icon>
                      <Callout.Text>
                        {state.error}
                      </Callout.Text>
                  </Callout.Root>
              }

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