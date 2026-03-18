"use client";

import {useEffect, useReducer, useState} from "react";
import {Button, IconButton, Skeleton, Strong, Table, Text, TextField} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditCommitteeDialog from "@/app/(committee)/people/EditPeopleDialog";
import DeleteCommitteeDialog from "@/app/(committee)/people/DeletePeopleDialog";
import { ToastProvider } from "@/app/components/Toast";
import { GET_PEOPLE_ENDPOINT, GET_ROLE_ENDPOINT } from "@/lib/endpoints";
import {initialState, peopleReducer} from "@/app/(committee)/people/peopleReducer";
import {API} from "@/interfaces/ICommittee";
import {IPerson} from "@/interfaces/ICommittee";
import Image from "next/image";


export default function ShowPage() {
  const [{people, loading, error}, dispatch] = useReducer(peopleReducer, initialState);
  const [search, setSearch] = useState("");

  //searchbar
  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.description?.toLowerCase().includes(search.toLowerCase()) ||
    person.fact?.toLowerCase().includes(search.toLowerCase())
  );

  // Fetch people on mount
  useEffect(() => {
    fetchPeople().then();
  }, []);

  // Fetch function
  const fetchPeople = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_PEOPLE_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json() as API<IPerson[]>;
        dispatch({ type: "FETCH_SUCCESS", payload: res.data.map((person) => ({
              id: person.id,
              name: person.name,
              course: person.course,
              description: person.description,
              fact: person.fact,
              song: person.song,
              photo: person.photo
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
    await fetchPeople(); // Re-fetch people to update the list
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving committee data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
      <ToastProvider>
      <Skeleton loading={loading}>
          {people.length === 0 && (
              <>
                <Text align="center" size="3">
                  <Strong>You have no committee members</Strong>
                </Text>
                <Text align="center" size="1">Create one below</Text>
              </>
          )}

          <EditCommitteeDialog onSuccess={handleSuccess}>
            <Button>
              <PlusIcon /> New committee member
            </Button>
          </EditCommitteeDialog>

          {people.length > 0 && (
              <>
                <TextField.Root
                  placeholder="Search committee members..."
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
                      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Fact</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Song</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell style={{textAlign:"center"}}>Photo</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>


                  <Table.Body>
                    {filteredPeople.toSorted((a, b) => a.name.localeCompare(b.name)).map((person, i) => (
                        <Table.Row key={i}>
                          <Table.RowHeaderCell>{person.id}</Table.RowHeaderCell>
                          <Table.Cell>{person.name}</Table.Cell>
                          <Table.Cell>{person.course ?? "None"}</Table.Cell>
                          <Table.Cell>{person.description ?? "None"}</Table.Cell>
                          <Table.Cell>{person.fact ?? "None"}</Table.Cell>
                          <Table.Cell>{person.song ?? "None"}</Table.Cell>
                          <Table.Cell>
                            <div style={{alignItems:"center", display:"flex", justifyContent:"center", flexDirection:"column"}}>
                              {person.photo ? (
                                  <Image src={"https://api.burnfm.com/uploads/committee_img/" + encodeURIComponent(person.photo)}alt=""width={100}height={100}/>
                              ) : (<div></div>)}
                              <div style={{width:"fit-content"}} >{person.photo ?? "None"}</div>
                            </div>  
                          </Table.Cell>                          
                          <Table.Cell>
                            <EditCommitteeDialog person={person} onSuccess={handleSuccess}>
                              <IconButton size="1" color="gray" variant="soft" type="button">
                                <Pencil1Icon/>
                              </IconButton>
                            </EditCommitteeDialog>
                            <div style={{marginBottom:"10px"}}></div>
                            <DeleteCommitteeDialog person_id={person.id} onSuccess={handleSuccess}>
                              <IconButton size="1" color="crimson" variant="soft" type="button">
                                <TrashIcon/>
                              </IconButton>
                            </DeleteCommitteeDialog>
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