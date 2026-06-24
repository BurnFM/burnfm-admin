"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField, DropdownMenu, Select} from "@radix-ui/themes";
import {isOverride, IOverride} from "@/interfaces/IOverride";
import {isShow, IShow} from "@/interfaces/IShow";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {INSERT_OVERRIDE_ENDPOINT, UPDATE_OVERRIDE_ENDPOINT, GET_RADIOSHOW_ENDPOINT} from "@/lib/endpoints";
import Image from "next/image";


export default function EditOverrideDialog({
  key,
  override,
  onSuccess,
  children
} : {
  key?: number,
  override?: IOverride,
  onSuccess?: () => void,
  children?: ReactNode
}) {

  const formatTime = (time: string) => time.slice(0, 5);
  const initial_form_data: IOverride | Omit<IOverride, 'id'> = override ? {
    ...override,
    startTime: formatTime(override.startTime),
    endTime: formatTime(override.endTime),
  } : {
    date: "",
    startTime: "00:00",
    endTime: "00:30",
    type: "",
    radioShowID: undefined
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data)
  const [radioShows, setRadioShows] = useState<{ id: number; title: string }[]>([]);
  const toast = useToast();
  const selectedShow = radioShows.find(
    (s) => s.id === form.radioShowID
  );

  // Define form action and state variables
  const [state, dispatch, isPending] = useActionState(
      async (previousState: null, payload: FormData) => {
        try {
          let response;
          if (!override) {
            response = await fetch(INSERT_OVERRIDE_ENDPOINT, {
              method: "POST",
              body: payload,  // For form-data type don't include Content-Type in header, otherwise issues
              headers: {
                'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
              }
            });
          } else {
             response = await fetch(UPDATE_OVERRIDE_ENDPOINT(override.id), {
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
            if (override)
              toast.showToast("Success", `Updated override with ID: ${body.updated_id}`);
            else
              toast.showToast("Success", `Added override with ID: ${body.id}`);
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

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(GET_RADIOSHOW_ENDPOINT(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const json = await response.json();

        const res = json.data as IShow[];

        setRadioShows(
          res.map((show) => ({
            id: show.id,
            title: show.title,
          })).sort((a, b) => a.title.localeCompare(b.title))
        );
      } catch (error) {
        console.error(error);
        toast.showToast(
          "Error",
          "An error occurred while fetching radio shows."
        );
      }
    };

    fetchSchedule();
      }, []);

      const timeOptions = Array.from({ length: 49 }, (_, i) => {
      const hours = Math.floor(i / 2);
      const minutes = (i % 2) * 30;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }); 

    const isAfter = (a: string, b: string) => a > b;
    const endTimeOptions = form.startTime
    ? timeOptions.filter((time) => time > form.startTime)
    : timeOptions;

    useEffect(() => {
      if (form.endTime && form.startTime && form.endTime <= form.startTime) {
        setForm((prev) => ({
          ...prev,
          endTime: "",
        }));
      }
    }, [form.startTime]);

    const add30Minutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + 30, 0, 0);

    return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    };

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
          <Dialog.Title>{override? "Edit Override": "New Override"}</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Define your override here. To change what is overrided
          </Dialog.Description>

          <form action={dispatch}>
            <Flex direction="column" gap="3">
              <div style={{display: "flex", justifyContent: "space-around"}}>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    date*
                  </Text>
                  <TextField.Root type="date"
                      name="date"
                      disabled={isPending}
                      value={form.date}
                      onChange={(x) =>
                          setForm({
                            ...form,
                            date: x.target.value
                      })}
                    />
                </label>

                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Start Time
                  </Text>
                  <Select.Root
                    value={form.startTime}
                    onValueChange={(value) => {
                      setForm((prev) => {
                        let newEnd = prev.endTime;

                        if (!newEnd || newEnd <= value) {
                          newEnd = add30Minutes(value);
                        }

                        return {
                          ...prev,
                          startTime: value,
                          endTime: newEnd,
                        };
                      });
                    }}
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {timeOptions.map((time) => (
                        <Select.Item key={time} value={time}>
                          {time}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {/* IMPORTANT: this is what gets submitted */}
                  <input type="hidden" name="start_time" value={form.startTime} />

                </label>
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    End Time
                  </Text>
                  <Select.Root
                    value={form.endTime}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        endTime: value,
                      })
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      {endTimeOptions.map((time) => (
                        <Select.Item key={time} value={time}>
                          {time}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  {/* IMPORTANT: this is what gets submitted */}
                  <input type="hidden" name="end_time" value={form.endTime} />
                </label>
              </div>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Type
                </Text>
                <Flex direction="column">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="soft" style={{ width: "max-content" }}>
                        {form.type || "Select a override type"}
                        <DropdownMenu.TriggerIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        key="none"
                        onSelect={() => setForm({ ...form, type: '' })}
                      >
                        None
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        key="Additional"
                        onSelect={() => setForm({ ...form, type: 'Additional' })}
                      >
                        Additional
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        key="Cancel"
                        onSelect={() => setForm({ ...form, type: 'Cancel', radioShowID: undefined })}
                      >
                        Cancel
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        key="Replace"
                        onSelect={() => setForm({ ...form, type: 'Replace' })}
                      >
                        Replace
                      </DropdownMenu.Item>

                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>

                {/* IMPORTANT: this is what gets submitted */}
                <input type="hidden" name="type" value={form.type} />
              </label>

              {(form.type === "Replace" || form.type === "Additional") && (
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Radio Show ID
                </Text>
                <Flex direction="column">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="soft" style={{ width: "max-content" }}>
                        {selectedShow?.title || "Select a show"}
                        <DropdownMenu.TriggerIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        key="none"
                        onSelect={() => setForm({ ...form, radioShowID: undefined })}
                      >
                        No show
                      </DropdownMenu.Item>
                      {radioShows.map((show) => (
                        <DropdownMenu.Item
                          key={show.id}
                          onSelect={() => {
                            setForm({
                              ...form,
                              radioShowID: show.id,
                            });
                          }}
                        >
                          {show.title}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>

                {/* IMPORTANT: this is what gets submitted */}
                <input type="hidden" name="radio_show_id" value={form.radioShowID ?? ""} />

              </label>)}



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
                Save Override
                <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
              </Button>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
  );
}