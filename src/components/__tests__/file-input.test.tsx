import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileInput } from "@/components/file-input.client";

describe("FileInput", () => {
  it("says no file is chosen, then names the chosen file and reports it", async () => {
    const onChange = vi.fn();

    render(<><label htmlFor="sheet">Kalkylark</label><FileInput id="sheet" accept=".xlsx" onChange={onChange} /></>);

    expect(screen.getByText("noFileChosen")).toBeInTheDocument();
    await userEvent.upload(screen.getByLabelText("Kalkylark"), new File(["x"], "spex.xlsx"));

    expect(screen.getByText("spex.xlsx")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: "spex.xlsx" }));
  });

  it("reports the same file chosen twice", async () => {
    const onChange = vi.fn();
    const file = new File(["x"], "spex.zip");

    render(<><label htmlFor="zip">Zip</label><FileInput id="zip" onChange={onChange} /></>);
    await userEvent.upload(screen.getByLabelText("Zip"), file);
    await userEvent.upload(screen.getByLabelText("Zip"), file);

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shows a file already there and a custom label, and opens the picker from its button", async () => {
    render(<FileInput id="f" current="gammal.zip" chooseLabel="Byt fil" onChange={vi.fn()} />);
    const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined);

    expect(screen.getByText("gammal.zip")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Byt fil" }));

    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("can be disabled", () => {
    render(<FileInput id="f" disabled onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "chooseFile" })).toBeDisabled();
  });
});
