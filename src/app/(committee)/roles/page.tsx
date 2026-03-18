"use client";

import {useEffect, useReducer, useState} from "react";
import {Button, IconButton, Skeleton, Strong, Table, Text, TextField, DropdownMenu} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import EditRoleDialog from "@/app/(committee)/roles/EditRoleDialog";
import DeleteRoleDialog from "@/app/(committee)/roles/DeleteRoleDialog";
import { ToastProvider } from "@/app/components/Toast";
import { GET_PEOPLE_ENDPOINT, GET_ROLE_ENDPOINT } from "@/lib/endpoints";
import {roleReducer, initialState as initialStateRole} from "@/app/(committee)/roles/roleReducer";
import {peopleReducer, initialState as initialStatePeople} from "@/app/(committee)/people/peopleReducer";
import {API} from "@/interfaces/ICommittee";
import {IRole, IPerson} from "@/interfaces/ICommittee";
import Image from "next/image";


export default function ShowPage() {
  const [{roles, loading, error}, dispatch] = useReducer(roleReducer, initialStateRole);
  const [people, setPeople] = useReducer(peopleReducer, initialStatePeople);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  var avalibleYears = Array.from(new Set(roles.map(role => role.year.toString()))).sort();

  //searchbar and dropwdown
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
    role.role.toLowerCase().includes(search.toLowerCase()) ||
    role.personID.toString().includes(search) ||
    role.year.toString().includes(search);

    const matchesYear = selectedYear === null || role.year.toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Fetch people on mount
  useEffect(() => {
    fetchPeople();
  }, []);

  // Fetch roles after people are loaded
  useEffect(() => {
    if (people.people.length > 0) {
      fetchRoles();
    }
  }, [people.people]); // runs whenever people.people updates

  // Fetch function
  const fetchRoles = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const responseRole = await fetch(GET_ROLE_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (responseRole.ok) {
        const resRole = await responseRole.json() as API<IRole[]>;
        dispatch({ type: "FETCH_SUCCESS", payload: resRole.data.map((role) => {
          const person = people.people.find(p => p.id === Number(role.personID));
          if (!person) throw new Error(`Person with ID ${role.personID} not found`);

          return {
            id: role.id,
            role: role.role,
            year: role.year,
            personID: person
          };
        })});
        avalibleYears = Array.from(new Set(roles.map(role => role.year.toString()))).sort();
      } else {
        throw new Error(responseRole.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({ type: "FETCH_FAILURE", payload: "An unexpected error occurred" })
    }
  };

  
    // Fetch function
    const fetchPeople = async () => {
      dispatch({ type: "FETCH_REQUEST" });
  
      try {
        const responsePeople = await fetch(GET_PEOPLE_ENDPOINT(), {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });
  
        if (responsePeople.ok) {
          const resPeople = await responsePeople.json() as API<IPerson[]>;
          setPeople({ type: "FETCH_SUCCESS", payload: resPeople.data.map((person) => ({
                id: person.id,
                name: person.name,
                course: person.course,
                description: person.description,
                fact: person.fact,
                song: person.song,
                photo: person.photo
            }))});
        } else {
          throw new Error(responsePeople.statusText);
        }
      } catch (error) {
        console.error(error);
        dispatch({ type: "FETCH_FAILURE", payload: "An unexpected error occurred" })
      }
    };

  // Handle creation or editing success
  const handleSuccess = async () => {
    await fetchPeople(); // Re-fetch people to update the list
    await fetchRoles(); // Re-fetch roles to update the list}
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving committee role data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
      <ToastProvider>
      <Skeleton loading={loading}>
          {roles.length === 0 && (
              <>
                <Text align="center" size="3">
                  <Strong>You have no committee roles</Strong>
                </Text>
                <Text align="center" size="1">Create one below</Text>
              </>
          )}

          <EditRoleDialog onSuccess={handleSuccess} people={people.people}>
            <Button>
              <PlusIcon /> New committee member role
            </Button>
          </EditRoleDialog>

          {roles.length > 0 && (
              <>
                <div style={{justifyContent:"space-between", display:"flex"}}>
                  <div style={{width:"100%"}}>
                    <TextField.Root
                      placeholder="Search committee member roles..."
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
                      <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>personID</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Photo</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>year</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>


                  <Table.Body>
                    {filteredRoles.toSorted((a, b) => a.role.localeCompare(b.role)).map((role, i) => (
                        <Table.Row key={i}>
                          <Table.RowHeaderCell>{role.id}</Table.RowHeaderCell>
                          <Table.Cell>{role.role}</Table.Cell>
                          <Table.Cell>{role.personID.id}</Table.Cell>
                          <Table.Cell>{role.personID.name}</Table.Cell>
                          <Table.Cell>
                            <div style={{alignItems:"center", display:"flex", justifyContent:"center", flexDirection:"column"}}>
                              {role.personID.photo ? (
                                  <Image src={"https://api.burnfm.com/uploads/committee_img/" + encodeURIComponent(role.personID.photo)}alt=""width={100}height={100}/>
                              ) : (<div></div>)}
                              <div style={{width:"fit-content"}} >{role.personID.photo ?? "None"}</div>
                            </div>  
                          </Table.Cell>
                          <Table.Cell>{role.year}</Table.Cell>
                          <Table.Cell>
                            <EditRoleDialog role={role} onSuccess={handleSuccess} people={people.people}>
                              <IconButton size="1" color="gray" variant="soft" type="button">
                                <Pencil1Icon/>
                              </IconButton>
                            </EditRoleDialog>
                            <div style={{marginBottom:"10px"}}></div>
                            <DeleteRoleDialog role_id={role.id} onSuccess={handleSuccess}>
                              <IconButton size="1" color="crimson" variant="soft" type="button">
                                <TrashIcon/>
                              </IconButton>
                            </DeleteRoleDialog>
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