"use client"

import {AlertDialog, Button, Flex} from "@radix-ui/themes";
import {ReactNode} from "react";

export default function DeleteEntryDialog({
  action,
  children,
} : {
  action: () => void,
  children?: ReactNode,
}) {

  // const toast = useToast();

  return (
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          { children }
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title mb="4">Remove this entry from schedule</AlertDialog.Title>
          <AlertDialog.Description size="2" mb="4">
            Are you sure you want to remove this entry from the schedule?
          </AlertDialog.Description>

          <Flex justify="end" gap="3">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action onClick={action}>
              <Button variant="soft" color="ruby">
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
  );
}