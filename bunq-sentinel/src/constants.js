/** Demo IBAN used for flagged / suspicious payment flows.
 *  Real sandbox recipient (Andre Hart) so cancel/draft flows can round-trip
 *  against bunq, but the local Finn scan still treats it as fraudulent. */
export const FLAGGED_IBAN = 'NL21BUNQ2106250509';
export const FLAGGED_NAME = 'Andre Hart';

/** Pool of legitimate sandbox recipients available for live payments.
 *  All IBANs are real bunq sandbox accounts and accept transfers. */
export const DEMO_RECIPIENTS = [
  { name: 'Eindhoven Student Housing B.V.', iban: 'NL54BUNQ2106266987', label: 'Rent payment' },
  { name: 'Julia Thompson',                 iban: 'NL29BUNQ2106257058', label: 'Splitting dinner' },
  { name: 'Trevor Barr',                    iban: 'NL43BUNQ2106247591', label: 'Repaying loan' },
  { name: 'Jenna Bradley',                  iban: 'NL93BUNQ2106261241', label: 'Concert tickets' },
  { name: 'Morgan Nixon',                   iban: 'NL56BUNQ2106267339', label: 'Coffee run' },
  { name: 'Niels Cooper',                   iban: 'NL33BUNQ2106270372', label: 'Birthday gift' },
  { name: 'Laura Sutherland',               iban: 'NL96BUNQ2106264291', label: 'Groceries' },
  { name: 'Val Haynes',                     iban: 'NL76BUNQ2106269404', label: 'Utility bill' },
  { name: 'Derick Wickham',                 iban: 'NL58BUNQ2106268661', label: 'Freelance invoice' },
  { name: 'Folkert Hardy',                  iban: 'NL51BUNQ2106262191', label: 'Car repair' },
];
