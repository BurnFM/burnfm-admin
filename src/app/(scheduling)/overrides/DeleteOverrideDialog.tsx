"use client"

import {AlertDialog, Button, Flex} from "@radix-ui/themes";
import {ReactNode, useState} from "react";
import {useToast} from "@/app/components/Toast";
import {DELETE_OVERRIDE_ENDPOINT} from "@/lib/endpoints";

export default function DeleteOverrideDialog({
  id,
  onSuccess,
  children,
} : {
  id: number,
  onSuccess?: () => void,
  children?: ReactNode
}) {

  const toast = useToast();

  const [open, setOpen] = useState(false);

  const deleteOverride = async () => {

    try {
      const response = await fetch(DELETE_OVERRIDE_ENDPOINT(id), {
        method: "DELETE",
        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`  // Pass the token for authorization
        }
      });
      if (response.ok) {
        if (onSuccess) onSuccess();
        setOpen(false);
        toast.showToast("Success", `Deleted override`);
      } else {
        toast.showToast("An error occurred", `${response.status} Error: ${response.statusText}`);
      }
    } catch (e) {
      console.log(e)
      toast.showToast("An error occurred", "An unexpected error occurred. Please refresh the page or try again later.");
    }
  }

  return (
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger>
          { children }
        </AlertDialog.Trigger>

        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete Override</AlertDialog.Title>
          <AlertDialog.Description size="2" mb="4">
            Are you sure you want to delete?
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="crimson" onClick={deleteOverride}>
                Delete Override
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
  );
}