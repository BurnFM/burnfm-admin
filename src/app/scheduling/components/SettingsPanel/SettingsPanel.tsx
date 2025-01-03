"use client"

import {useEffect, useReducer, useState} from "react";
import {Box, Button, Callout, Flex, Heading, IconButton, Popover, Select, Switch, Text} from "@radix-ui/themes";
import {ExclamationTriangleIcon, QuestionMarkCircledIcon} from "@radix-ui/react-icons";
import {initialState, iSettings, settingsReducer} from "@/app/scheduling/components/SettingsPanel/settingsReducer";
import {GET_RADIOSHOW_ENDPOINT, GET_SETTINGS_ENDPOINT, UPDATE_SETTINGS_ENDPOINT} from "@/lib/endpoints";
import {IShow} from "@/interfaces/IShow";

export default function SettingsPanel() {
  const [{settings, shows, loading, error}, dispatch] = useReducer(settingsReducer, initialState);
  const [originalSettings, setOriginalSettings] = useState<iSettings>(initialState.settings)
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings().then();
  }, []);

  const fetchSettings = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    const data: {
      settings?: iSettings,
      shows: { id: number, title: string }[]
    } = {
      settings: undefined,
      shows: []
    }

    try {
      const response = await fetch(GET_SETTINGS_ENDPOINT, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = await response.json();
        console.log(res);
        data.settings = res;
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
        payload: "An error occurred while fetching General Settings"
      });
      return;
    }

    try {
      const response = await fetch(GET_RADIOSHOW_ENDPOINT(), {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const res = (await response.json()).shows as IShow[];
        console.log(res);
        data.shows = res.map(show => ({id: show.id, title: show.title}));
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
        payload: "An error occurred while fetching Shows"
      });
      return;
    }

    dispatch({
      type: "FETCH_SUCCESS",
      payload: {
        settings: data.settings!,
        shows: data.shows
      }
    });

    setOriginalSettings(data.settings!);
  };

  const updateSettings = async () => {
    dispatch({ type: "FETCH_REQUEST" });

    try {
      const response = await fetch(UPDATE_SETTINGS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(settings),

        headers: {
          'Authorization': `${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        dispatch({ type: "UPDATE_SUCCESS" });
        setOriginalSettings(settings);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "FETCH_FAILURE",
        payload: "An error occurred while saving changes to General Settings"
      });
    }
  };

  return (
      <Flex direction="column" gap="2" mb="4">
        <Heading size="3">General Settings</Heading>

        <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap">
          {/* Default Show Switch */}
          <Text as="label">
            <Flex gap="4" align="center">
              <Switch
                  checked={settings.defaultShow.enabled}
                  onCheckedChange={(checked) =>
                      dispatch({ type: "TOGGLE_DEFAULT_SHOW", payload: checked })
                  }
                  disabled={loading || error != null}
              />
              <Box>
                <Text as="p" size="2" weight="medium">Use default show</Text>
                <Text as="p" size="1">Choose a show to be displayed whenever there is a gap in the schedule.</Text>
              </Box>

            </Flex>
          </Text>

          { settings.defaultShow.enabled &&

            <Text as="label" size="2">
              <Flex gap="2" align="center">
                Default Show:
                <Select.Root value={"" + settings.defaultShow.show}
                             disabled={!settings.defaultShow.enabled || loading || error != null}
                             onValueChange={(value) =>
                                 dispatch({ type: "SET_DEFAULT_SHOW", payload: parseInt(value) })
                             }>
                  <Select.Trigger />
                  <Select.Content>
                    {
                      shows.map((show) =>
                          <Select.Item key={show.id} value={""+show.id}>{show.title}</Select.Item>
                      )
                    }
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Text>
          }
        </Flex>

        <Flex direction="row" gap="3" align="center" justify="between" wrap="wrap">
          <Text as="label">
            <Flex gap="4" align="center">
              <Switch
                  checked={settings.offAirMode.enabled}
                  onCheckedChange={(checked) =>
                      dispatch({ type: "TOGGLE_OFF_AIR_MODE", payload: checked })
                  }
                  disabled={loading || error != null}
              />
              <Box>
                <Text as="p" size="2" weight="medium">
                  Off-Air mode
                  <Popover.Root>
                    <Popover.Trigger>
                      <IconButton size="1" variant="ghost" ml="1">
                        <QuestionMarkCircledIcon width="18" height="18" />
                      </IconButton>
                    </Popover.Trigger>
                    <Popover.Content size="1" maxWidth="300px">
                      <Text as="p" trim="both" size="1">
                        This is useful for over the holidays, or if the station has an unexpected
                        period where no shows are presenting.
                      </Text>
                    </Popover.Content>
                  </Popover.Root>
                </Text>
                <Text as="p" size="1">Instantly replace the current schedules with a single show.</Text>
              </Box>

            </Flex>
          </Text>

          { settings.offAirMode.enabled &&

            <Text as="label" size="2">
              <Flex gap="2" align="center">
                Off-Air Show:
                <Select.Root
                  value={"" + settings.offAirMode.show}
                  disabled={!settings.offAirMode.enabled || loading || error != null}
                  onValueChange={(value) =>
                      dispatch({ type: "SET_OFF_AIR_MODE_SHOW", payload: parseInt(value) })
                  }
                >
                  <Select.Trigger />
                  <Select.Content>
                    {
                      shows.map((show) =>
                          <Select.Item key={show.id} value={""+show.id}>{show.title}</Select.Item>
                      )
                    }
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Text>
          }

        </Flex>

        {/* Action Buttons */}
        { hasChanges && (
            <Flex gap="2" wrap="wrap">
              <Button variant="soft"
                      color="gray"
                      onClick={() => dispatch({ type: "RESET_SETTINGS", payload: originalSettings })}>
                Revert changes
              </Button>
              <Button onClick={updateSettings}>Apply changes</Button>
            </Flex>
        )}

        { error &&
            <Callout.Root role={"alert"} color={"crimson"}>
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                {error}
              </Callout.Text>
            </Callout.Root>
        }

      </Flex>
  );
}