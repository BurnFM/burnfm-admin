"use client";

import {useEffect, useReducer} from "react";
import {Button, IconButton, Skeleton, Strong, Table, Text, TextField} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditShowDialog from "@/app/(shows)/shows/EditShowDialog";
import { ToastProvider } from "@/app/components/Toast";
import DeleteShowDialog from "@/app/(shows)/shows/DeleteShowDialog";
import { GET_RADIOSHOW_ENDPOINT } from "@/lib/endpoints";
import {initialState, showsReducer} from "@/app/(shows)/shows/showsReducer";
import {API} from "@/interfaces/ISchedule";
import {IShow} from "@/interfaces/IShow";


export default function ShowPage() {
  const [{shows, loading, error}, dispatch] = useReducer(showsReducer, initialState);

  // Fetch shows on mount
  useEffect(() => {
    fetchShows().then();
  }, []);

  // Fetch function
  const fetchShows = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_RADIOSHOW_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json() as API<IShow[]>;
        dispatch({ type: "FETCH_SUCCESS", payload: res.data.map((show) => ({
            id: show.id,
            title: show.title,
            description: show.description,
            hosts: show.hosts,
            photo: show.photo,
          }))});
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: "FETCH_FAILURE", payload: "An unexpected error occurred" })
    }
  };

  // Handle creation or editing success
  const handleSuccess = async () => {
    await fetchShows(); // Re-fetch shows to update the list
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving show data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
      <ToastProvider>
      <Skeleton loading={loading}>
          {shows.length === 0 && (
              <>
                <Text align="center" size="3">
                  <Strong>You have no Shows</Strong>
                </Text>
                <Text align="center" size="1">Create one below</Text>
              </>
          )}


          <EditShowDialog onSuccess={handleSuccess}>
            <Button>
              <PlusIcon /> New show
            </Button>
          </EditShowDialog>

          {shows.length > 0 && (
              <>
                <TextField.Root placeholder="Search shows...">
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="15" width="15" />
                  </TextField.Slot>
                </TextField.Root>

                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Title*</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Photo</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Hosts</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>


                  <Table.Body>
                    {shows.toSorted((a, b) => a.title.localeCompare(b.title)).map((show, i) => (
                        <Table.Row key={i}>
                          <Table.RowHeaderCell>{show.id}</Table.RowHeaderCell>
                          <Table.Cell>{show.title}</Table.Cell>
                          <Table.Cell>{show.description}</Table.Cell>
                          <Table.Cell>{show.photo ?? "None"}</Table.Cell>
                          <Table.Cell>{show.hosts.join(", ")}</Table.Cell>
                          <Table.Cell>
                            <EditShowDialog show={show} onSuccess={handleSuccess}>
                              <IconButton size="1" color="gray" variant="soft" type="button">
                                <Pencil1Icon/>
                              </IconButton>
                            </EditShowDialog>
                            <DeleteShowDialog show_id={show.id} onSuccess={handleSuccess}>
                              <IconButton size="1" color="crimson" variant="soft" type="button">
                                <TrashIcon/>
                              </IconButton>
                            </DeleteShowDialog>
                          </Table.Cell>
                        </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </>
          )}
      </Skeleton>
      </ToastProvider>
  );
}