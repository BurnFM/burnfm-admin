"use client";

import {useEffect, useReducer, useState, Suspense} from "react";
import {Text, Box, Flex, Heading, Container, IconButton, Skeleton, Strong, Table, TextField, Button, DropdownMenu} from "@radix-ui/themes";
import {ImageIcon, MagnifyingGlassIcon, Pencil1Icon, UploadIcon, TrashIcon } from "@radix-ui/react-icons";
import UploadImageDialog from "@/app/images/UploadImageDialog";
import DeleteImageDialog from "@/app/images/DeleteImageDialog";
import { GET_SHOW_IMAGES_ENDPOINT, GET_PODCAST_IMAGES_ENDPOINT, GET_PEOPLE_IMAGES_ENDPOINT } from "@/lib/endpoints";
import {initialState, imageReducer} from "@/app/images/imagesReducer";
import {IImage} from "@/interfaces/IImage";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


function ImagesContent() {
  const [{images, loading, error}, dispatch] = useReducer(imageReducer, initialState);
  const searchParams = useSearchParams();
  const router = useRouter();

  const validFilters = ["shows", "podcasts", "committees", "all"] as const;

  const requestedFilter = searchParams.get("use");

  const filter = validFilters.includes(requestedFilter as typeof validFilters[number])
      ? requestedFilter!
      : "all";

  useEffect(() => {
      if (requestedFilter !== filter) {
          router.replace(`/images?use=${filter}`);
      }
  }, [requestedFilter, filter, router]);

  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  //searchbar
  const filteredImages = images.filter((image) => {
    const imageName = image.name.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = imageName.includes(q);
    const matchesFilter = filter === "all" || image.use === filter;
    return matchesSearch && matchesFilter;
  });

  // Fetch overrides on mount
  useEffect(() => {
    fetchImages().then();
  }, []);

  // Handle creation or editing success
  const handleSuccess = async () => {
    await fetchImages(); // Re-fetch images to update the list
  };

  // Fetch function
  const fetchImages = async () => {
      dispatch({ type: "FETCH_REQUEST" });

      try {
          const [showResponse, podcastResponse, peopleResponse] = await Promise.all([
              fetch(GET_SHOW_IMAGES_ENDPOINT),
              fetch(GET_PODCAST_IMAGES_ENDPOINT),
              fetch(GET_PEOPLE_IMAGES_ENDPOINT)
          ]);

          if (!showResponse.ok || !podcastResponse.ok || !peopleResponse.ok) {
              throw new Error("Failed to fetch images");
          }

          const [showImages, podcastImages, peopleImages] = await Promise.all([
              showResponse.json() as Promise<string[]>,
              podcastResponse.json() as Promise<string[]>,
              peopleResponse.json() as Promise<string[]>
          ]);

          const images: IImage[] = [
              ...showImages.map((image) => ({
                  name: image,
                  location: `https://api.burnfm.com/uploads/show_img/${encodeURIComponent(image)}`,
                  use: "shows"
              })),
              ...podcastImages.map((image) => ({
                  name: image,
                  location: `https://api.burnfm.com/uploads/podcast_img/${encodeURIComponent(image)}`,
                  use: "podcasts"
              })),
              ...peopleImages.map((image) => ({
                  name: image,
                  location: `https://api.burnfm.com/uploads/committee_img/${encodeURIComponent(image)}`,
                  use: "committees"
              }))
          ];
          
          dispatch({ type: "FETCH_SUCCESS", payload: images });

      } catch (error) {
          console.error(error);
          dispatch({
              type: "FETCH_FAILURE",
              payload: "An unexpected error occurred"
          });
      }
  };

  if (error)
    return (
        <>
          <Text align="center" size="3">
            <Strong>An error occurred while retrieving image data</Strong>
          </Text>
          <Text align="center" size="1">{error}</Text>
        </>
    );

  return (
    <Flex height="100%" direction="column" flexGrow="1">
        <Box>
          <Container size="4" height="100%" p="6" style={{backgroundColor: "var(--accent-3)", borderBottom: "1px solid var(--accent-6)"}}>
            <Flex align="center" gap="3" mb="4">
              <ImageIcon style={{color: "var(--accent-11)"}} height={30} width={30}/>
              <Heading id="heading" style={{color: "var(--accent-11)"}}>Images</Heading>
            </Flex>
            <Flex direction="column" gap="1">
              <Text weight="medium" style={{color: "var(--accent-12)"}}>Create, edit, and delete images</Text>
            </Flex>
          </Container>
        </Box>

        <Navbar justify="center" links={[
            {href: "/images?use=all", label: "All Images"},
            {href: "/images?use=shows", label: "Shows"},
            {href: "/images?use=podcasts", label: "Podcasts"},
            {href: "/images?use=committees", label: "Committees"}
        ]}/>
    
        <Container size="4" p="6">
          <Flex direction="column" gap="3">
              <Skeleton loading={loading}>
                {images.length === 0 && (
                  <>
                    <Text align="center" size="3">
                      <Strong>You have no Images</Strong>
                    </Text>
                    <Text align="center" size="1">
                      Upload an image below
                    </Text>
                  </>
                )}
        
                <UploadImageDialog onSuccess={handleSuccess} defaultUse={filter}>
                  <Button>
                    <UploadIcon/> Upload Image
                  </Button>
                </UploadImageDialog>
        
                {images.length > 0 && (
                  <>
                    <TextField.Root
                      placeholder="Search images..."
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
                          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Use</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Location: https://api.burnfm.com/uploads/</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Image</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>
        
                      <Table.Body>
                        {filteredImages
                          .toSorted((a, b) => a.name.localeCompare(b.name))
                          .map((image, i) => (
                            <Table.Row key={image.name}>
                              <Table.RowHeaderCell>{image.name}</Table.RowHeaderCell>
                              <Table.Cell>{image.use}</Table.Cell>
                              <Table.Cell>
                                <Link
                                    href={image.location}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {image.location.replace("https://api.burnfm.com/uploads/", "")}
                                </Link>
                              </Table.Cell>
                              <Table.Cell>
                                <Image
                                  src={image.location}
                                  alt=""
                                  width={100}
                                  height={100}
                                />
                              </Table.Cell>
                              <Table.Cell>
                                <DeleteImageDialog
                                  image={image}
                                  onSuccess={handleSuccess}
                                >
                                  <IconButton
                                    size="1"
                                    color="crimson"
                                    variant="soft"
                                    type="button"
                                  >
                                    <TrashIcon />
                                  </IconButton>
                                </DeleteImageDialog>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                      </Table.Body>
                    </Table.Root>
                  </>
                )}
              </Skeleton>
          </Flex>
        </Container>
      </Flex>
  );
}

export default function ImagesPage() {
    return (
        <Suspense fallback={<div />}>
            <ImagesContent />
        </Suspense>
    );
}