"use client"

import {Button, Dialog, Flex, Kbd, Link, Text, TextArea, TextField, DropdownMenu} from "@radix-ui/themes";
import {IScheduleExtended} from "@/interfaces/ISchedule";
import {ReactNode, useActionState, useState, useEffect} from "react";
import NextLink from "next/link";
import {useToast} from "@/app/components/Toast";
import {DUPLICATE_SCHEDULE_ENDPOINT} from "@/lib/endpoints";

export default function DuplicateScheduleDialog({
  key,
  schedule,
  onSuccess,
  children
} : {
  key?: number,
  schedule?: IScheduleExtended,
  onSuccess?: () => void,
  children?: ReactNode
}){
  const initial_form_data: IScheduleExtended | Omit<IScheduleExtended, 'id'> = schedule ?? {
    name: "",
    start_date: new Date(),
    end_date: new Date(),
    active: false,
    entries: [],
  }

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial_form_data)

  const toast = useToast();

  const [state, dispatch, isPending] = useActionState(
    async(previousState: null, payload: FormData) => {
      try {
        let response;
        if (schedule) {
          response = await fetch(DUPLICATE_SCHEDULE_ENDPOINT(schedule.id), {
            method: 'POST',
            body: payload,
            headers: {
              'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
            }
          });
        } else {
          throw new Error("No schedule id provided for duplication");
        }
        
        if (response.ok) {
          if (onSuccess) onSuccess();
          setOpen(false);
          toast.showToast("Success", `Schedule duplicated successfully`);
          return null;
        } else {
          toast.showToast("An error occurred", `${response.status} Error: ${response.statusText}`);
          return null;
        }
      }
      catch (e) {
        console.log(e)
        toast.showToast("An error occurred", "An unexpected error occurred. Please refresh the page or try again later.");
        return null;
      }
    },
    null
  );

  return (
    <Dialog.Root key={key} open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <span>{children}</span>
      </Dialog.Trigger>

    <Dialog.Content maxWidth="450px">
      <Dialog.Title>Duplicate Schedule</Dialog.Title>

      <form action={dispatch}>
        <Flex direction="column" gap="3">
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
              placeholder="Enter schedule name"
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray" disabled={isPending}>
            Discard
            <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Esc</Kbd>
          </Button>
        </Dialog.Close>
        <Button type={"submit"} loading={isPending}>
          Duplicate Schedule
          <Kbd style={{background: "rgba(255,255,255, 0.1)", boxShadow: "none"}}>Enter ⏎</Kbd>
        </Button>
      </Flex>

      </form>

    </Dialog.Content>

    </Dialog.Root>
  );
}