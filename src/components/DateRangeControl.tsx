import { classes } from "./classes.js";
import { lastDays, type DateRange, type DateRangePreset } from "./dateRange.js";

export interface DateRangeControlProps {
  readonly value: DateRange;
  readonly onChange: (value: DateRange) => void;
  /** The current `YYYY-MM-DD` day. A preset ends at it. */
  readonly today: string;
  readonly presets?: readonly DateRangePreset[];
  /** The accessible name of the group. */
  readonly label: string;
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly className?: string;
}

const noPresets: readonly DateRangePreset[] = [];

/** A range of days: presets and two date inputs. */
export function DateRangeControl({
  className,
  fromLabel,
  label,
  onChange,
  presets = noPresets,
  today,
  toLabel,
  value,
}: DateRangeControlProps) {
  return (
    <fieldset
      aria-label={label}
      className={classes("od-date-range", className)}
    >
      {presets.length === 0 ? null : (
        <span className="od-segmented" data-size="small">
          {presets.map((preset) => {
            const range = lastDays(today, preset.days);
            return (
              <button
                aria-pressed={
                  range.from === value.from && range.to === value.to
                }
                key={preset.days}
                onClick={() => {
                  onChange(range);
                }}
                type="button"
              >
                {preset.label}
              </button>
            );
          })}
        </span>
      )}
      <span className="od-date-range-inputs">
        <input
          aria-label={fromLabel}
          max={value.to}
          onChange={(event) => {
            if (event.currentTarget.value !== "") {
              onChange({ ...value, from: event.currentTarget.value });
            }
          }}
          type="date"
          value={value.from}
        />
        <span aria-hidden="true">–</span>
        <input
          aria-label={toLabel}
          max={today}
          min={value.from}
          onChange={(event) => {
            if (event.currentTarget.value !== "") {
              onChange({ ...value, to: event.currentTarget.value });
            }
          }}
          type="date"
          value={value.to}
        />
      </span>
    </fieldset>
  );
}
