"use client";

import {useEffect, useReducer, useState} from "react";
import {Button, Container, IconButton, Skeleton, Strong, Table, Text, TextField} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditOverrideDialog from "@/app/(scheduling)/overrides/EditOverrideDialog";
import { ToastProvider } from "@/app/components/Toast";
import DeleteOverrideDialog from "@/app/(scheduling)/overrides/DeleteOverrideDialog";
import { GET_OVERRIDES_ENDPOINT, GET_RADIOSHOW_ENDPOINT } from "@/lib/endpoints";
import {initialState, overridesReducer} from "@/app/(scheduling)/overrides/overrideReducer";
import {API} from "@/interfaces/ISchedule";
import {IOverride} from "@/interfaces/IOverride";
import {IShow} from "@/interfaces/IShow";
import Image from "next/image";


export default function OverridesPage() {
  const [{overrides, loading, error}, dispatch] = useReducer(overridesReducer, initialState);
  const [search, setSearch] = useState("");

  type RadioShowLookup = {
    id: number;
    title: string;
  };

  const [radioShows, setRadioShows] = useState<RadioShowLookup[]>([]);

  const getShowTitle = (id: number) => {
    return radioShows.find((s) => s.id === id)?.title ?? "Unknown show";
  };

  //searchbar
  const filteredOverrides = overrides.filter((override) => {
    const showTitle = getShowTitle(override.radioShowID ?? 0).toLowerCase();

    const date = new Date(override.date)
      .toLocaleDateString("en-GB")
      .toLowerCase();

    const startTime = override.startTime?.slice(0, 5).toLowerCase();
    const endTime = override.endTime?.slice(0, 5).toLowerCase();

    const type = override.type?.toLowerCase() ?? "";
    const radioShowID = override.radioShowID?.toString() ?? "";

    const q = search.toLowerCase();

    return (
      type.includes(q) ||
      radioShowID.includes(q) ||
      showTitle.includes(q) ||
      date.includes(q) ||
      startTime.includes(q) ||
      endTime.includes(q)
    );
  });

  // Fetch overrides on mount
  useEffect(() => {
    fetchOverrides().then();
  }, []);

  // Fetch function
  const fetchOverrides = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_OVERRIDES_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json() as API<IOverride[]>;
        console.log(res);
        dispatch({ type: "FETCH_SUCCESS", payload: res.data.map((override) => ({
            id: override.id,
            date: override.date,
            startTime: override.startTime,
            endTime: override.endTime,
            type: override.type,
            radioShowID: override.radioShowID,
          }))});
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: "FETCH_FAILURE", payload: "An unexpected error occurred" })
    }
  };

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
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchSchedule();
  }, []);

  const formatTime = (time: string) => time.slice(0, 5);

  // Handle creation or editing success
  const handleSuccess = async () => {
    await fetchOverrides(); // Re-fetch overrides to update the list
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving override data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
      <ToastProvider>

      <Container p="3"></Container> {/* used for padding as the main schedule page I removed the padding*/}

      <Skeleton loading={loading}>
          {overrides.length === 0 && (
              <>
                <Text align="center" size="3">
                  <Strong>You have no overrides</Strong>
                </Text>
                <Text align="center" size="1">Create one below</Text>
              </>
          )}

          <EditOverrideDialog onSuccess={handleSuccess}>
            <Button>
              <PlusIcon /> New override
            </Button>
          </EditOverrideDialog>

          {overrides.length > 0 && (
              <>
                <TextField.Root
                  placeholder="Search overrides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                >
                  <TextField.Slot>
                    <MagnifyingGlassIcon height="15" width="15" />
                  </TextField.Slot>
                </TextField.Root>

                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Start Time</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>End Time</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>New Show</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>


                  <Table.Body>
                    {filteredOverrides.toSorted((a, b) => a.date.localeCompare(b.date)).map((override, i) => (
                        <Table.Row key={override.id}>
                          <Table.Cell>{override.id}</Table.Cell>
                          <Table.Cell>{new Date(override.date).toLocaleDateString("en-GB")}</Table.Cell>
                          <Table.Cell>{formatTime(override.startTime)}</Table.Cell>
                          <Table.Cell>{formatTime(override.endTime)}</Table.Cell>
                          <Table.Cell>{override.type}</Table.Cell>
                          <Table.Cell>{override.radioShowID?getShowTitle(override.radioShowID):"N/A"}</Table.Cell>
                          <Table.Cell>
                            <EditOverrideDialog override={override} onSuccess={handleSuccess}>
                              <IconButton size="1" color="gray" variant="soft" type="button">
                                <Pencil1Icon/>
                              </IconButton>
                            </EditOverrideDialog>
                            <div style={{marginBottom:"10px"}}></div>
                            <DeleteOverrideDialog id={override.id} onSuccess={handleSuccess}>
                              <IconButton size="1" color="crimson" variant="soft" type="button">
                                <TrashIcon/>
                              </IconButton>
                            </DeleteOverrideDialog>
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