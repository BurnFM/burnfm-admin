"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField, DropdownMenu} from "@radix-ui/themes";
import {isRole, IRole} from "@/interfaces/ICommittee";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {INSERT_ROLE_ENDPOINT, UPDATE_ROLE_ENDPOINT} from "@/lib/endpoints";
import Image from "next/image";
import { iRole } from "./roleReducer";
import { iPerson } from "../people/peopleReducer";

export default function EditRoleDialog({
  key,
  role,
  onSuccess,
  children,
  people
} : {
  key?: number,
  role?: iRole,
  onSuccess?: () => void,
  children?: ReactNode
  people: iPerson[],
}) {
  const initial_form_data: IRole | Omit<iRole, 'id'> = role ?? {
      role: "",
      personID: -1,
      year: new Date().getFullYear() % 100,  // default to current year
  }

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data)
  const [selectedPerson, setSelectedPerson] = useState<iPerson | null>(
    role ? people?.find(p => p.id === role.personID) ?? null : null
  );
  useEffect(() => {
    if (!people?.length) return;

    if (role) {
      // existing edit logic
      const personToSelect = typeof role.personID === "object"
        ? role.personID
        : people.find(p => p.id === role.personID);

      setSelectedPerson(personToSelect ?? null);
      setForm(prev => ({
        ...prev,
        personID: typeof role.personID === "object" ? role.personID.id : role.personID
      }));
    } else {
      // new role logic: default to first person in the list
      const firstPerson = people[0];
      setSelectedPerson(firstPerson);
      setForm(prev => ({ ...prev, personID: firstPerson?.id ?? -1 }));
    }
  }, [people, role]);


  const toast = useToast();

  // Define form action and state variables
  const [state, dispatch, isPending] = useActionState(
      async (previousState: null, payload: FormData) => {
        try {
          let response;
          if (!role) {
            response = await fetch(INSERT_ROLE_ENDPOINT, {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              }
            });
          } else {
            response = await fetch(UPDATE_ROLE_ENDPOINT(role.id), {
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
            if (role)
              toast.showToast("Success", `Updated role with ID: ${body.updated_id}`);
            else
              toast.showToast("Success", `Added role with ID: ${body.id}`);
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
          <Dialog.Title>{role? "Edit Role": "New Role"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Edit data about committe member role.
          </Dialog.Description>

          <form action={dispatch}>
            <Flex direction="column" gap="3">
              {isRole(form) &&
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
                  Role*
                </Text>
                <TextField.Root
                    name="role"
                    disabled={isPending}
                    value={form.role}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          role: x.target.value
                        })}
                    placeholder="Enter the person's role"
                    required
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Persons ID*
                </Text>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft" style={{ width: "max-content" }}>
                      {selectedPerson ? selectedPerson.name : "Select a person"}
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    {(people ?? []).map((person) => (
                      <DropdownMenu.Item
                        key={person.id}
                        onSelect={() => {
                          setSelectedPerson(person);
                          setForm({ ...form, personID: Number(person.id) });
                          console.log("Selected person:", person.id);
                        }}
                      >
                        {person.name}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
                <input type="hidden" name="personID" value={form.personID} />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  2 digits of first academic year (e.g. 23 for 2023-2024)*
                </Text>
                <TextField.Root
                    name="year"
                    disabled={isPending}
                    value={form.year.toString()}
                    onChange={(x) =>
                        setForm({
                          ...form,
                          year: Number(x.target.value)
                        })}
                    placeholder="Enter the 2 digits of the year"
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
                Save committee member role
                <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}