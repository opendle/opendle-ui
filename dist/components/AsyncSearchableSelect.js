import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useReducer, useRef, } from "react";
import { FormField } from "./Form.js";
const initialState = {
    activeIndex: -1,
    cursorPhase: "idle",
    draftQuery: null,
    nextCursor: null,
    open: false,
    options: [],
    searchPhase: "loading",
};
function stableOptions(previous, page) {
    const values = new Set(previous.map((option) => option.value));
    const result = [...previous];
    for (const option of page) {
        if (values.has(option.value))
            continue;
        values.add(option.value);
        result.push(option);
    }
    return result;
}
function usableCursor(value, seenCursors) {
    if (typeof value !== "string" ||
        value.trim().length === 0 ||
        seenCursors.has(value)) {
        return null;
    }
    return value;
}
function choicesFor(options, allowNoSelection, noSelectionLabel) {
    const choices = options.map((option) => ({
        key: `option:${option.value}`,
        label: option.label,
        option,
    }));
    if (allowNoSelection) {
        choices.unshift({
            key: "no-selection",
            label: noSelectionLabel,
            option: null,
        });
    }
    return choices;
}
function choiceDisabled(choice) {
    return Boolean(choice.option?.disabled);
}
function enabledChoiceIndex(choices, start, direction) {
    if (choices.length === 0)
        return -1;
    let index = Math.min(Math.max(start, 0), choices.length - 1);
    let count = 0;
    while (count < choices.length) {
        const choice = choices[index];
        if (choice && !choiceDisabled(choice))
            return index;
        index = (index + direction + choices.length) % choices.length;
        count += 1;
    }
    return -1;
}
function moveChoiceIndex(choices, current, direction) {
    if (choices.length === 0)
        return -1;
    let index = current;
    let count = 0;
    while (count < choices.length) {
        index = (index + direction + choices.length) % choices.length;
        const choice = choices[index];
        if (choice && !choiceDisabled(choice))
            return index;
        count += 1;
    }
    return current;
}
function selectedChoiceIndex(choices, selectedValue) {
    const index = choices.findIndex((choice) => (choice.option?.value ?? null) === selectedValue);
    const selected = choices[index];
    if (selected && !choiceDisabled(selected))
        return index;
    return enabledChoiceIndex(choices, 0, 1);
}
function reduceAsyncSelector(state, action) {
    switch (action.type) {
        case "activate":
            return { ...state, activeIndex: action.activeIndex };
        case "open":
            return { ...state, activeIndex: action.activeIndex, open: true };
        case "close":
            return {
                ...state,
                ...(action.resetSearch
                    ? {
                        cursorPhase: "idle",
                        nextCursor: null,
                        options: [],
                        searchPhase: "loading",
                    }
                    : {}),
                activeIndex: -1,
                draftQuery: null,
                open: false,
            };
        case "query":
            return {
                ...state,
                activeIndex: -1,
                cursorPhase: "idle",
                draftQuery: action.query,
                nextCursor: null,
                open: true,
                options: [],
                searchPhase: "loading",
            };
        case "search-started":
            return {
                ...state,
                activeIndex: -1,
                cursorPhase: "idle",
                nextCursor: null,
                options: [],
                searchPhase: "loading",
            };
        case "search-succeeded":
            return {
                ...state,
                activeIndex: action.activeIndex,
                cursorPhase: "idle",
                nextCursor: action.nextCursor,
                options: action.options,
                searchPhase: action.options.length === 0 ? "empty" : "ready",
            };
        case "search-failed":
            return {
                ...state,
                activeIndex: -1,
                cursorPhase: "idle",
                nextCursor: null,
                options: [],
                searchPhase: "failed",
            };
        case "cursor-started":
            return { ...state, cursorPhase: "loading" };
        case "cursor-succeeded":
            return {
                ...state,
                cursorPhase: "idle",
                nextCursor: action.nextCursor,
                options: stableOptions(state.options, action.options),
            };
        case "cursor-failed":
            return { ...state, cursorPhase: "failed" };
        case "selection-committed":
            return {
                ...state,
                activeIndex: -1,
                draftQuery: null,
                open: false,
            };
    }
}
function useAsyncSelectorController({ allowNoSelection, debounceMs, disabled, loadOptions, noSelectionLabel, onChange, value, }) {
    const inputRef = useRef(null);
    const requestGenerationRef = useRef(0);
    const activeControllerRef = useRef(null);
    const cursorPendingRef = useRef(false);
    const seenCursorsRef = useRef(new Set());
    const [state, dispatch] = useReducer(reduceAsyncSelector, initialState);
    const query = state.draftQuery ?? "";
    const choices = choicesFor(state.options, allowNoSelection, noSelectionLabel);
    const safeActiveIndex = state.activeIndex >= 0 && state.activeIndex < choices.length
        ? state.activeIndex
        : -1;
    const activeChoice = safeActiveIndex >= 0 ? choices[safeActiveIndex] : undefined;
    const startSearch = useCallback((searchQuery) => {
        const generation = ++requestGenerationRef.current;
        activeControllerRef.current?.abort();
        seenCursorsRef.current.clear();
        const controller = new AbortController();
        activeControllerRef.current = controller;
        cursorPendingRef.current = false;
        dispatch({ type: "search-started" });
        void Promise.resolve()
            .then(() => loadOptions({
            cursor: null,
            query: searchQuery,
            signal: controller.signal,
        }))
            .then((page) => {
            if (controller.signal.aborted ||
                generation !== requestGenerationRef.current) {
                return;
            }
            const loadedOptions = stableOptions([], page.options);
            const loadedChoices = choicesFor(loadedOptions, allowNoSelection, noSelectionLabel);
            dispatch({
                activeIndex: selectedChoiceIndex(loadedChoices, value?.value ?? null),
                nextCursor: usableCursor(page.nextCursor, seenCursorsRef.current),
                options: loadedOptions,
                type: "search-succeeded",
            });
        }, () => {
            if (controller.signal.aborted ||
                generation !== requestGenerationRef.current) {
                return;
            }
            dispatch({ type: "search-failed" });
        });
    }, [allowNoSelection, loadOptions, noSelectionLabel, value?.value]);
    useEffect(() => {
        if (!state.open || disabled)
            return;
        const timer = window.setTimeout(() => {
            startSearch(query);
        }, debounceMs);
        return () => {
            window.clearTimeout(timer);
        };
    }, [debounceMs, disabled, query, startSearch, state.open]);
    useEffect(() => {
        if (!disabled)
            return;
        requestGenerationRef.current += 1;
        activeControllerRef.current?.abort();
        cursorPendingRef.current = false;
        dispatch({ resetSearch: true, type: "close" });
    }, [disabled]);
    useEffect(() => () => {
        requestGenerationRef.current += 1;
        activeControllerRef.current?.abort();
    }, []);
    function cancelCurrentRequest() {
        requestGenerationRef.current += 1;
        activeControllerRef.current?.abort();
        cursorPendingRef.current = false;
    }
    function openOptions() {
        if (disabled)
            return;
        dispatch({
            activeIndex: selectedChoiceIndex(choices, value?.value ?? null),
            type: "open",
        });
    }
    function closeOptions() {
        const resetSearch = state.draftQuery !== null;
        cancelCurrentRequest();
        dispatch({ resetSearch, type: "close" });
    }
    function closeWhenFocusLeaves(event) {
        const nextTarget = event.relatedTarget;
        if (nextTarget && event.currentTarget.contains(nextTarget))
            return;
        closeOptions();
    }
    function changeQuery(event) {
        cancelCurrentRequest();
        dispatch({ query: event.currentTarget.value, type: "query" });
    }
    function selectChoice(choice) {
        if (disabled || choiceDisabled(choice))
            return;
        cancelCurrentRequest();
        inputRef.current?.focus();
        onChange(choice.option);
        dispatch({ type: "selection-committed" });
    }
    function moveActiveChoice(event) {
        if (disabled)
            return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            if (!state.open) {
                openOptions();
            }
            else {
                dispatch({
                    activeIndex: moveChoiceIndex(choices, state.activeIndex >= 0
                        ? state.activeIndex
                        : direction === 1
                            ? choices.length - 1
                            : 0, direction),
                    type: "activate",
                });
            }
        }
        else if (event.key === "Home" && state.open) {
            event.preventDefault();
            dispatch({
                activeIndex: enabledChoiceIndex(choices, 0, 1),
                type: "activate",
            });
        }
        else if (event.key === "End" && state.open) {
            event.preventDefault();
            dispatch({
                activeIndex: enabledChoiceIndex(choices, choices.length - 1, -1),
                type: "activate",
            });
        }
        else if (event.key === "Enter" && state.open && activeChoice) {
            event.preventDefault();
            selectChoice(activeChoice);
        }
        else if (event.key === "Escape" && state.open) {
            event.preventDefault();
            closeOptions();
        }
    }
    function retrySearch() {
        inputRef.current?.focus();
        startSearch(query);
    }
    function loadNextPage() {
        const cursor = usableCursor(state.nextCursor, seenCursorsRef.current);
        if (disabled ||
            cursor === null ||
            cursorPendingRef.current ||
            state.searchPhase === "failed") {
            return;
        }
        const generation = ++requestGenerationRef.current;
        activeControllerRef.current?.abort();
        const controller = new AbortController();
        activeControllerRef.current = controller;
        cursorPendingRef.current = true;
        dispatch({ type: "cursor-started" });
        void Promise.resolve()
            .then(() => loadOptions({
            cursor,
            query,
            signal: controller.signal,
        }))
            .then((page) => {
            if (controller.signal.aborted ||
                generation !== requestGenerationRef.current) {
                return;
            }
            seenCursorsRef.current.add(cursor);
            dispatch({
                nextCursor: usableCursor(page.nextCursor, seenCursorsRef.current),
                options: page.options,
                type: "cursor-succeeded",
            });
            cursorPendingRef.current = false;
            inputRef.current?.focus();
        }, () => {
            if (controller.signal.aborted ||
                generation !== requestGenerationRef.current) {
                return;
            }
            dispatch({ type: "cursor-failed" });
            cursorPendingRef.current = false;
            inputRef.current?.focus();
        });
    }
    return {
        activeChoice,
        choices,
        closeWhenFocusLeaves,
        inputRef,
        loadNextPage,
        moveActiveChoice,
        openOptions,
        query,
        retrySearch,
        safeActiveIndex,
        selectChoice,
        state,
        changeQuery,
    };
}
function AsyncSelectorPopover({ activeChoice, choices, cursorPhase, emptyLabel, errorLabel, labelId, listboxId, loadMoreErrorLabel, loadMoreLabel, loadNextPage, loadingLabel, loadingMoreLabel, nextCursor, retryLabel, retrySearch, searchPhase, selectChoice, selectedValue, }) {
    const selectedChoice = choices.find((choice) => (choice.option?.value ?? null) === selectedValue);
    return (_jsxs("div", { className: "od-async-searchable-select-popover", children: [_jsx("select", { "aria-busy": searchPhase === "loading" || undefined, "aria-labelledby": labelId, className: "od-async-searchable-select-listbox", id: listboxId, onChange: (event) => {
                    const choice = choices.find((item) => item.key === event.currentTarget.value);
                    if (choice)
                        selectChoice(choice);
                }, size: Math.min(Math.max(choices.length, 2), 8), tabIndex: -1, value: activeChoice?.key ?? selectedChoice?.key ?? "", children: choices.map((choice, index) => (_jsxs("option", { className: "od-async-searchable-select-option", "data-active": choice.key === activeChoice?.key || undefined, disabled: choiceDisabled(choice), id: `${listboxId}-choice-${String(index)}`, onPointerDown: (event) => {
                        event.preventDefault();
                        selectChoice(choice);
                    }, value: choice.key, children: [choice.label, choice.option?.description
                            ? ` — ${choice.option.description}`
                            : ""] }, choice.key))) }), searchPhase === "loading" ? (_jsx("p", { className: "od-async-searchable-select-state", children: loadingLabel })) : null, searchPhase === "empty" ? (_jsx("p", { className: "od-async-searchable-select-state", children: emptyLabel })) : null, searchPhase === "failed" ? (_jsxs("div", { className: "od-async-searchable-select-state", children: [_jsx("p", { children: errorLabel }), _jsx("button", { onClick: retrySearch, type: "button", children: retryLabel })] })) : null, searchPhase !== "loading" && searchPhase !== "failed" ? (_jsxs("div", { className: "od-async-searchable-select-cursor", children: [cursorPhase === "failed" ? _jsx("p", { children: loadMoreErrorLabel }) : null, nextCursor !== null ? (_jsx("button", { "aria-busy": cursorPhase === "loading" || undefined, "aria-disabled": cursorPhase === "loading" || undefined, onClick: loadNextPage, type: "button", children: cursorPhase === "loading"
                            ? loadingMoreLabel
                            : cursorPhase === "failed"
                                ? retryLabel
                                : loadMoreLabel })) : null] })) : null] }));
}
export function AsyncSearchableSelect({ allowNoSelection = false, className, debounceMs = 250, disabled = false, emptyLabel = "No options found.", error, errorLabel = "Unable to load options.", help, id, label, loadMoreErrorLabel = "Unable to load more options.", loadMoreLabel = "Load more", loadingLabel = "Loading options…", loadingMoreLabel = "Loading more options…", loadOptions, name, noSelectionLabel = "No selection", onChange, placeholder = "Search options", required = false, requirement, retryLabel = "Retry", value, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid, }) {
    if (!Number.isSafeInteger(debounceMs) || debounceMs < 0) {
        throw new Error("AsyncSearchableSelect debounceMs must be a non-negative integer.");
    }
    const generatedInputId = useId();
    const labelId = useId();
    const listboxId = useId();
    const inputId = id ?? generatedInputId;
    const { activeChoice, changeQuery, choices, closeWhenFocusLeaves, inputRef, loadNextPage, moveActiveChoice, openOptions, retrySearch, safeActiveIndex, selectChoice, state, } = useAsyncSelectorController({
        allowNoSelection,
        debounceMs,
        disabled,
        loadOptions,
        noSelectionLabel,
        onChange,
        value,
    });
    const isRequired = required || requirement === "required";
    const isOpen = state.open && !disabled;
    const selectionInvalid = !disabled && isRequired && value === null;
    const inputValue = state.draftQuery ?? value?.label ?? "";
    const liveMessage = !isOpen
        ? null
        : state.cursorPhase === "loading"
            ? loadingMoreLabel
            : state.cursorPhase === "failed"
                ? loadMoreErrorLabel
                : state.searchPhase === "loading"
                    ? loadingLabel
                    : state.searchPhase === "failed"
                        ? errorLabel
                        : state.searchPhase === "empty"
                            ? emptyLabel
                            : `${String(state.options.length)} options available.`;
    const comboboxAccessibilityProps = {
        "aria-controls": isOpen ? listboxId : undefined,
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
        role: "combobox",
    };
    useEffect(() => {
        inputRef.current?.setCustomValidity(selectionInvalid ? "Select an option from the list." : "");
    }, [inputRef, selectionInvalid]);
    return (_jsxs("div", { className: ["od-async-searchable-select", className]
            .filter(Boolean)
            .join(" "), "data-open": isOpen || undefined, onBlur: closeWhenFocusLeaves, children: [_jsx(FormField, { controlId: inputId, error: error, help: help, label: _jsx("span", { id: labelId, children: label }), ...(requirement || isRequired
                    ? { requirement: isRequired ? "required" : requirement }
                    : {}), children: _jsx("input", { ref: inputRef, ...comboboxAccessibilityProps, "aria-activedescendant": isOpen && safeActiveIndex >= 0
                        ? `${listboxId}-choice-${String(safeActiveIndex)}`
                        : undefined, "aria-autocomplete": "list", "aria-describedby": ariaDescribedBy, "aria-invalid": selectionInvalid ? true : ariaInvalid, "aria-labelledby": labelId, "aria-required": isRequired || undefined, autoComplete: "off", className: "od-async-searchable-select-input", disabled: disabled, onChange: changeQuery, onClick: () => {
                        if (!isOpen)
                            openOptions();
                    }, onFocus: () => {
                        if (!isOpen)
                            openOptions();
                    }, onKeyDown: moveActiveChoice, placeholder: placeholder, required: isRequired, type: "text", value: inputValue }) }), name ? (_jsx("input", { disabled: disabled, name: name, type: "hidden", value: value?.value ?? "" })) : null, _jsx("output", { "aria-live": state.searchPhase === "failed" || state.cursorPhase === "failed"
                    ? "assertive"
                    : "polite", className: "od-visually-hidden", children: liveMessage }), isOpen ? (_jsx(AsyncSelectorPopover, { activeChoice: activeChoice, choices: choices, cursorPhase: state.cursorPhase, emptyLabel: emptyLabel, errorLabel: errorLabel, labelId: labelId, listboxId: listboxId, loadMoreErrorLabel: loadMoreErrorLabel, loadMoreLabel: loadMoreLabel, loadNextPage: loadNextPage, loadingLabel: loadingLabel, loadingMoreLabel: loadingMoreLabel, nextCursor: state.nextCursor, retryLabel: retryLabel, retrySearch: retrySearch, searchPhase: state.searchPhase, selectChoice: selectChoice, selectedValue: value?.value ?? null })) : null] }));
}
//# sourceMappingURL=AsyncSearchableSelect.js.map