import React, { useCallback, useMemo } from "react";
import { FastField, Formik, getIn, useFormikContext } from "formik";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
    EnumValueConfig,
    EnumValues,
    NumberProperty,
    StringProperty
} from "../../../../models";
import { resolveEnumValues } from "../../../utils";
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import { ArrayContainer } from "../../../../form";
import DebouncedTextField from "../../../../form/components/DebouncedTextField";
import { useDebounce } from "../../../internal/useDebounce";
import equal from "react-fast-compare"
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { CustomDialogActions } from "../../CustomDialogActions";

export function EnumPropertyField({
                                      multiselect,
                                      updateIds
                                  }: { multiselect: boolean, updateIds: boolean }) {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const schemaRegistry = useSchemaRegistry();
    const enumValuesPath = multiselect ? "of.enumValues" : "enumValues";

    const valuesEnumValues = getIn(values, enumValuesPath);
    const enumValues: EnumValueConfig[] = useMemo(() => {
        if (!valuesEnumValues || typeof valuesEnumValues === "boolean")
            return [] as EnumValueConfig[];
        return resolveEnumValues(valuesEnumValues, schemaRegistry.enumConfigs) ?? [] as EnumValueConfig[];
    }, [schemaRegistry.enumConfigs, valuesEnumValues]);

    const [internalValue, setInternalValue] = React.useState<EnumValueConfig[]>(enumValues);
    const doUpdate = React.useCallback(() => {
        if (!equal(internalValue, enumValues)) {
            setFieldValue(enumValuesPath, internalValue);
        }
    }, [internalValue, enumValues]);
    useDebounce(internalValue, doUpdate, 64);

    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Values
                </Typography>

                <Paper
                    variant={"outlined"}
                    sx={{ p: 2, mt: 1 }}>
                    <EnumForm enumValues={enumValues}
                              updateIds={updateIds}
                              onValuesChanged={setInternalValue}/>
                </Paper>
            </Grid>

            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    {!multiselect &&
                        <StringPropertyValidation/>}
                    {multiselect &&
                        <ArrayPropertyValidation/>}
                </Paper>
            </Grid>

        </>
    );
}

export function EnumForm({
                             enumValues,
                             onValuesChanged,
                             updateIds,
                         }: {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    updateIds: boolean;
}) {

    return (
        <Formik initialValues={{ enumValues }}
                onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                }}
                render={({ values }) => {

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const doUpdate = useCallback(() => {
                        if (onValuesChanged) {
                            onValuesChanged(values.enumValues);
                        }
                    }, [values.enumValues]);
// eslint-disable-next-line react-hooks/rules-of-hooks
                    useDebounce(values.enumValues, doUpdate, 100);

                    const buildEntry = (index: number, internalId: number) => {
                        return <EnumEntry index={index}
                                          updateIds={updateIds}
                                          key={`${internalId}`}/>;
                    };

                    return (
                        <ArrayContainer
                            value={values.enumValues}
                            name={"enumValues"}
                            buildEntry={buildEntry}
                            disabled={false}
                            small={true}
                            includeAddButton={true}/>
                    );
                }}
        />

    );

}

function EnumEntry({
                       index,
                       updateIds,
                   }: { index: number, updateIds: boolean }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const labelValue = getIn(values, `enum[${index}].label`);
    const idValue = getIn(values, `enumValues[${index}].id`);

    const currentLabelRef = React.useRef(labelValue);

    React.useEffect(() => {
        if (currentLabelRef.current === idValue && updateIds) {
            setFieldValue(`enumValues[${index}].id`, labelValue);
        }
        currentLabelRef.current = labelValue;
    }, [labelValue]);

    const idError = getIn(errors, "id");
    return (
        <Box display={"flex"} width={"100%"} alignItems={"center"}>
            <Box width={"100%"} mx={1}>
                <FastField name={`enumValues[${index}].label`}
                    // key={`${idValue}`}
                           as={DebouncedTextField}
                           required
                           fullWidth
                           helperText={idError}
                           size="small"
                           autoComplete="off"
                           error={Boolean(idError)}/>
            </Box>
            <Box>
                <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={() => setDialogOpen(true)}>
                    <SettingsOutlinedIcon fontSize={"small"}/>
                </IconButton>
            </Box>
            <EnumEntryDialog index={index}
                             open={dialogOpen}
                             onClose={() => setDialogOpen(false)}/>
        </Box>);
}

function EnumEntryDialog({
                             index,
                             open,
                             onClose,
                         }: {
    index: number;
    open: boolean;
    onClose: () => void;
}) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const idError = getIn(errors, "id");
    return <Dialog
        maxWidth="md"
        aria-labelledby="delete-dialog"
        open={open}
        onBackdropClick={onClose}
    >

        <DialogContent>
            <FastField name={`enumValues[${index}]id`}
                       as={DebouncedTextField}
                       required
                       fullWidth
                       label={"ID"}
                       helperText={idError ?? "Value saved in the data source"}
                       size="small"
                       autoComplete="off"
                       error={Boolean(idError)}/>
        </DialogContent>

        <CustomDialogActions>
            <Button
                autoFocus
                onClick={onClose}
                color="primary">
                Ok
            </Button>
        </CustomDialogActions>

    </Dialog>
}