"use client";

import {useEffect, useReducer, useState} from "react";
import {Text, Box, Flex, Heading, Container, IconButton, Skeleton, Strong, Table, TextField, Button, DropdownMenu} from "@radix-ui/themes";
import {DashboardIcon, MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditCommitteeDialog from "@/app/committee/EditPeopleDialog";
import DeleteCommitteeDialog from "@/app/committee/DeletePeopleDialog";
import { ToastProvider } from "@/app/components/Toast";
import { GET_COMMITTEE_ENDPOINT } from "@/lib/endpoints";
import {initialState, peopleReducer} from "@/app/committee/peopleReducer";
import {API} from "@/interfaces/ICommittee";
import {IPerson} from "@/interfaces/ICommittee";
import Image from "next/image";


export default function ShowPage() {
  const [{people, loading, error}, dispatch] = useReducer(peopleReducer, initialState);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  var avalibleYears = Array.from(new Set(people.map(person => person.year.toString()))).sort();

  //searchbar and dropwdown
  const filteredPeople = people.filter((person) => {
    const matchesSearch =
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.description?.toLowerCase().includes(search.toLowerCase()) ||
    person.fact?.toLowerCase().includes(search.toLowerCase()) ||
    person.year.toString().includes(search);

    const matchesYear = selectedYear === null || person.year.toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Fetch people on mount
  useEffect(() => {
    fetchPeople().then();
  }, []);

  // Fetch function
  const fetchPeople = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(GET_COMMITTEE_ENDPOINT(), {
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
              role: person.role,
              course: person.course,
              description: person.description,
              fact: person.fact,
              song: person.song,
              photo: person.photo,
              year: person.year
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
    <Flex height="100%" direction="column" flexGrow="1">
        <Box>
          <Container size="4" height="100%" p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
            <Flex align="center" gap="3" mb="4">
              <DashboardIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
              <Heading id="heading" style={{color: "var(--accent-11)"}}>Committee</Heading>
            </Flex>
            <Flex direction="column" gap="1">
              <Text weight="medium" style={{color: "var(--accent-12)"}}>Create, edit, and delete committee</Text>
            </Flex>
          </Container>
        </Box>
    
        <Container size="4" p="6">
          <Flex direction="column" gap="3">
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
                      <div style={{justifyContent:"space-between", display:"flex"}}>
                        <div style={{width:"100%"}}>
                          <TextField.Root
                            placeholder="Search committee members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          >
                            <TextField.Slot>
                              <MagnifyingGlassIcon height="15" width="15" />
                            </TextField.Slot>
                          </TextField.Root>
                        </div>

                        <div style={{paddingLeft:"10px"}}>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                              <Button variant="soft" style={{width:"max-content"}}>
                                Year: {selectedYear ?? "All"}
                                <DropdownMenu.TriggerIcon />
                              </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                              <DropdownMenu.Item onSelect={() => setSelectedYear(null)}>
                                All
                              </DropdownMenu.Item>
                              {avalibleYears.map((year) => (
                                  <DropdownMenu.Item key={year} onSelect={() => setSelectedYear(year)}>
                                    {year}
                                  </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        </div>

                      </div>

                      <Table.Root variant="surface">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Course</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Fact</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Song</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell style={{textAlign:"center"}}>Photo</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell >Year</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                          </Table.Row>
                        </Table.Header>


                        <Table.Body>
                          {filteredPeople.toSorted((a, b) => a.name.localeCompare(b.name)).map((person, i) => (
                              <Table.Row key={i}>
                                <Table.RowHeaderCell>{person.id}</Table.RowHeaderCell>
                                <Table.Cell>{person.name}</Table.Cell>
                                <Table.Cell>{person.role}</Table.Cell>
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
                                <Table.Cell>{person.year}</Table.Cell>                         
                                <Table.Cell>
                                  <EditCommitteeDialog key={person.id} person={person} onSuccess={handleSuccess}>
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
          </Flex>
        </Container>
      </Flex>
  );
}