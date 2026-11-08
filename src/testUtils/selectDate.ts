import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/** Choose a date through the same custom controls used in the application. */
export async function selectDate(label: string, value: string) {
  const date = new Date(`${value}T12:00:00`);
  const year = date.getFullYear();
  await userEvent.click(screen.getByRole("button", { name: label }));
  const calendar = within(screen.getByRole("dialog", { name: `Calendar for ${label}` }));
  await userEvent.click(calendar.getByRole("button", { name: "Choose year" }));
  while (!calendar.queryByRole("button", { name: String(year) })) {
    const firstYear = Number(calendar.getByRole("button", { name: "Choose year" }).textContent?.split(" – ")[0]);
    await userEvent.click(calendar.getByRole("button", { name: year < firstYear ? "Previous years" : "Next years" }));
  }
  await userEvent.click(calendar.getByRole("button", { name: String(year) }));
  await userEvent.click(calendar.getByRole("button", { name: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date) }));
  await userEvent.click(calendar.getByRole("button", { name: new Intl.DateTimeFormat("en-GB", { dateStyle: "full" }).format(date) }));
}
