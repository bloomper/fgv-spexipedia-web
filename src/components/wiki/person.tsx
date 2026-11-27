import { personLabel, type PersonLike } from "@/utils/wiki";

/**
 * A spexare as the viewer may see them, linked to Spexregister for those who can open it there. Renders nothing when
 * there is nothing to show (a visitor and a spexare without a nickname).
 */
export function PersonName({ person }: { person: PersonLike | null | undefined }) {
  const label = personLabel(person);

  if (!label) {
    return null;
  }
  return person?.url ? (
    <a
      href={person.url}
      className="hover:text-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  ) : (
    <span>{label}</span>
  );
}

/**
 * People in a row, comma separated, leaving out those not shown.
 */
export function PersonList({ people }: { people: readonly (PersonLike | null | undefined)[] }) {
  const shown = people.filter((person) => personLabel(person));

  return (
    <>
      {shown.map((person, index) => (
        <span key={person?.id ?? index}>
          {index > 0 && ", "}
          <PersonName person={person} />
        </span>
      ))}
    </>
  );
}

type Credit = { name?: string | null; person?: PersonLike | null };

/**
 * Credits: spexare as above, people outside FGV by their name.
 */
export function CreditList({ credits }: { credits: readonly Credit[] }) {
  const shown = credits.filter((credit) => personLabel(credit.person) || credit.name);

  return (
    <>
      {shown.map((credit, index) => (
        <span key={index}>
          {index > 0 && ", "}
          {credit.person ? <PersonName person={credit.person} /> : credit.name}
        </span>
      ))}
    </>
  );
}
