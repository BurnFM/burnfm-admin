"use client";

import {useEffect, useReducer, useState} from "react";
import {Button, IconButton, Skeleton, Strong, Table, Text, TextField} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditPodcastDialog from "@/app/(shows)/podcasts/EditPodcastDialog";
import { ToastProvider } from "@/app/components/Toast";
import DeletePodcastDialog from "@/app/(shows)/podcasts/DeletePodcastDialog";
import { GET_PODCAST_ENDPOINT } from "@/lib/endpoints";
import {initialState, podcastsReducer} from "@/app/(shows)/podcasts/podcastsReducer";
import {Ipodcast} from "@/interfaces/IPodcast";
import {API} from "@/interfaces/ISchedule";
import Image from "next/image";


export default function PodcastPage() {
  const [{podcasts, loading, error}, dispatch] = useReducer(podcastsReducer, initialState);
  const [search, setSearch] = useState("");

  //searchbar
  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.id.toString().includes(search) ||
    podcast.title.toLowerCase().includes(search.toLowerCase()) ||
    podcast.description?.toLowerCase().includes(search.toLowerCase()) ||
    podcast.hosts.join(", ").toLowerCase().includes(search.toLowerCase()) ||
    podcast.startDate?.includes(search) ||
    podcast.endDate?.includes(search)
  );

  // Fetch podcasts on mount
  useEffect(() => {
    fetchPodcasts().then();
  }, []);

  // Fetch function
  const fetchPodcasts = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_PODCAST_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json() as API<Ipodcast[]>;
        dispatch({ type: "FETCH_SUCCESS", payload: res.data.map((podcast) => ({
            id: podcast.id,
            title: podcast.title,
            description: podcast.description,
            hosts: podcast.hosts,
            photo: podcast.photo,
            startDate: podcast.startDate,
            endDate: podcast.endDate,
            latestShow: podcast.latestShow
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
    await fetchPodcasts(); // Re-fetch podcasts to update the list
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving podcast data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
      <ToastProvider>
      <Skeleton loading={loading}>
          {podcasts.length === 0 && (
              <>
                <Text align="center" size="3">
                  <Strong>You have no podcasts</Strong>
                </Text>
                <Text align="center" size="1">Create one below</Text>
              </>
          )}

          <EditPodcastDialog onSuccess={handleSuccess}>
            <Button>
              <PlusIcon /> New podcast
            </Button>
          </EditPodcastDialog>

          {podcasts.length > 0 && (
              <>
                <TextField.Root
                  placeholder="Search podcasts..."
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
                      <Table.ColumnHeaderCell>Title*</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Start Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>End Date</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{textAlign:"center"}}>Photo</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Hosts</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Latest Show</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>


                  <Table.Body>
                    {filteredPodcasts.toSorted((a, b) => a.title.localeCompare(b.title)).map((podcast, i) => (
                        <Table.Row key={podcast.id}>
                          <Table.RowHeaderCell>{podcast.id}</Table.RowHeaderCell>
                          <Table.Cell>{podcast.title}</Table.Cell>
                          <Table.Cell>{podcast.description}</Table.Cell>
                          <Table.Cell>{podcast.startDate === "0000-00-00" ? "None" : podcast.startDate}</Table.Cell> 
                          <Table.Cell>{podcast.endDate === "0000-00-00" ? "None" : podcast.endDate}</Table.Cell> 
                          <Table.Cell>
                            <div style={{alignItems:"center", display:"flex", justifyContent:"center", flexDirection:"column"}}>
                              {podcast.photo ? (
                                  <Image src={"https://api.burnfm.com/uploads/podcast_img/" + encodeURIComponent(podcast.photo)}alt=""width={100}height={100}/>
                              ) : (<div></div>)}
                              <div style={{width:"fit-content"}} >{podcast.photo ?? "None"}</div>
                            </div>  
                          </Table.Cell>                       
                          <Table.Cell>{podcast.hosts.join(", ")}</Table.Cell>
                          <Table.Cell>{podcast.latestShow}</Table.Cell>
                          <Table.Cell>
                            <EditPodcastDialog podcast={podcast} onSuccess={handleSuccess}>
                              <IconButton size="1" color="gray" variant="soft" type="button">
                                <Pencil1Icon/>
                              </IconButton>
                            </EditPodcastDialog>
                            <div style={{marginBottom:"10px"}}></div>
                            <DeletePodcastDialog podcast_id={podcast.id} onSuccess={handleSuccess}>
                              <IconButton size="1" color="crimson" variant="soft" type="button">
                                <TrashIcon/>
                              </IconButton>
                            </DeletePodcastDialog>
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