import React, { useCallback, useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import InputBase from "@mui/material/InputBase";
import { alpha, darken, Theme } from "@mui/material/styles";
import { FormControl, IconButton } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import clsx from "clsx";

const PREFIX = 'SearchBar';

const classes = {
    search: `${PREFIX}-search`,
    searchIcon: `${PREFIX}-searchIcon`,
    inputRoot: `${PREFIX}-inputRoot`,
    inputInput: `${PREFIX}-inputInput`,
    inputActive: `${PREFIX}-inputActive`
};

const StyledFormControl = styled(FormControl)((
   { theme } : {
        theme: Theme
    }
) => ({
    [`& .${classes.search}`]: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 40,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.05) : darken(theme.palette.background.default, 0.2),
        "&:hover": {
            backgroundColor: theme.palette.mode === "light" ? alpha(theme.palette.common.black, 0.10) : darken(theme.palette.background.default, 0.3)
        },
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(1),
            width: "auto"
        }
    },

    [`& .${classes.searchIcon}`]: {
        padding: theme.spacing(0, 2),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },

    [`& .${classes.inputRoot}`]: {
        color: "inherit",
        minHeight: "inherit"
    },

    [`& .${classes.inputInput}`]: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            width: "12ch"
        }
    },

    [`& .${classes.inputActive}`]: {
        [theme.breakpoints.up("sm")]: {
            width: "20ch"
        }
    }
}));


interface SearchBarProps {
    onTextSearch: (searchString?: string) => void;
}

export function SearchBar({ onTextSearch }: SearchBarProps) {



    const [searchText, setSearchText] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);

    /**
     * Debounce on Search text update
     */
    useEffect(
        () => {
            const handler = setTimeout(() => {
                if (searchText) {
                    onTextSearch(searchText);
                } else {
                    onTextSearch(undefined);
                }
            }, 250);

            return () => {
                clearTimeout(handler);
            };
        },
        [searchText]
    );

    const clearText = useCallback(() => {
        setSearchText("");
        onTextSearch(undefined);
    }, []);

    return (
        <StyledFormControl>
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon htmlColor={"#666"}/>
                </div>
                <InputBase
                    placeholder="Search"
                    value={searchText}
                    onChange={(event) => {
                        setSearchText(event.target.value);
                    }}
                    onFocus={() => setActive(true)}
                    onBlur={() => setActive(false)}
                    classes={{
                        root: classes.inputRoot,
                        input: clsx(classes.inputInput, {
                            [classes.inputActive]: active
                        })
                    }}
                    endAdornment={searchText
                        ? <IconButton
                            size={"small"}
                            onClick={clearText}>
                            <ClearIcon fontSize={"small"}/>
                        </IconButton>
                        : <div style={{ width: 26 }}/>
                    }
                    inputProps={{ "aria-label": "search" }}
                />
            </div>
        </StyledFormControl>
    );
}