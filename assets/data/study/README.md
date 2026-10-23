# B02 datasets: data dictionary

All data are fictional, generated for teaching. Every business, person, e-mail address and number here is invented; the e-mail addresses use the reserved example.com, example.org and example.net domains.

The three files are deliberately messy. Each was generated as a clean table and then given known defects, so the course and the Data Cleaning Lab can check your work. This page describes what each column should contain and which kinds of problem to look for; it does not say where they are.

- Encoding: UTF-8, comma-separated, with a header row. Text containing commas is in double quotes.
- Regenerate with `node tools/study-datasets.mjs` (fixed seeds, so the files come out identical).

## lantern-orders.csv — Lantern Coffee Co. online-shop orders

The order export from the online shop of Lantern Coffee Co., a fictional coffee roaster, for 1 March – 30 June 2026. Customers buy bags of beans, a cold-brew pack and a gift box, either as one-off orders or as a monthly subscription delivery. One row per order; `order_id` should identify each order once.

240 rows, 14 columns. One row per order.

| Column | Meaning | Type | Unit | Valid values |
|---|---|---|---|---|
| `order_id` | Order number | identifier | — | `LC-` followed by five digits; unique |
| `order_date` | Date the order was placed | date | — | 1 March – 30 June 2026 |
| `customer_id` | Customer number (a customer can have several orders) | identifier | — | `C` followed by four digits |
| `email` | Customer e-mail address | text | — | lower case, no spaces; addresses use the reserved example.com, example.org and example.net domains |
| `region` | Delivery region | category | — | North, South, East, West, Central |
| `product` | Product name | category | — | 11 products, e.g. House Blend 250g, Ethiopia Yirgacheffe 250g, Decaf Colombia 1kg, Cold Brew Pack, Gift Box Trio |
| `size_g` | Pack size | number (integer) | grams | 250, 480, 750 or 1000 |
| `quantity` | Number of packs ordered | number (integer) | packs | 1 to 200 |
| `unit_price` | Price of one pack | number | US dollars | $14.00 to $58.00 (the list prices) |
| `discount` | Discount on the whole order (10% for subscribers and bulk orders; $5 promotion codes) | number | US dollars | 0 or more |
| `order_total` | Amount charged | number | US dollars | quantity × unit_price − discount, to the cent |
| `channel` | Where the order was placed | category | — | web, app |
| `subscription` | Whether the order is a subscription delivery | yes/no | — | yes, no |
| `rating` | Customer’s rating of the order | number (integer) | stars | 1 to 5, or blank if the customer gave no rating |

**Problems you will find**

- Exact duplicate rows (the export repeated some lines).
- Order ids that appear twice with a value changed between the copies.
- Dates in several formats: ISO (2026-03-04), day/month/year (04/03/2026), month/day/two-digit year (3/14/26), written out (March 5, 2026) and spreadsheet serial numbers (46085). Some slash dates can be read either way.
- Prices stored as text, with `$` signs and thousands separators, and one price written with a decimal comma.
- Negative, zero and impossible quantities.
- Region spelled several ways (case, stray spaces, abbreviations, typing errors).
- Product names with stray spaces and inconsistent capitals.
- Missing e-mail addresses, and addresses with capitals or stray spaces.
- Order totals that don’t equal quantity × unit_price − discount.
- One genuine bulk order and one typing-error outlier: extreme values that need different decisions.
- Missing ratings. Not every customer rates an order, and whether a rating is missing depends on another column.

## harborview-bookings.csv — Harborview Hotel bookings

Bookings at the Harborview Hotel, a fictional 80-room hotel, for stays from June 2025 to May 2026. One row per booking; `booking_id` should identify each booking once.

180 rows, 13 columns. One row per booking.

| Column | Meaning | Type | Unit | Valid values |
|---|---|---|---|---|
| `booking_id` | Booking reference | identifier | — | `HB-` followed by five digits; unique |
| `booked_on` | Date the booking was made | date | — | on or before check_in |
| `check_in` | Arrival date | date | — | 1 June 2025 – 31 May 2026 |
| `check_out` | Departure date | date | — | after check_in |
| `nights` | Nights booked | number (integer) | nights | 1 to 14; equals the days between check_in and check_out |
| `room_type` | Room booked | category | — | Standard, Deluxe, Family, Suite |
| `adults` | Adults in the room | number (integer) | people | 1 to 4 |
| `children` | Children in the room | number (integer) | people | 0 to 3 |
| `rate` | Nightly room rate | number | US dollars | $100 to $500 |
| `channel` | How the booking was made | category | — | Direct, OTA (online travel agency), Phone, Corporate, Travel agent |
| `country` | Guest’s country of residence | category | — | full English country names, e.g. United States, Canada, United Kingdom |
| `status` | Outcome of the booking | category | — | Completed, Cancelled, No-show |
| `total` | Booked room charge | number | US dollars | nights × rate, for every booking including cancellations |

**Problems you will find**

- Check-out dates before check-in.
- Nights that don’t match the dates.
- Placeholder rates (0 and 9999).
- Country written as codes and as names (US, USA, us, United States …).
- Blank `children` that means 0 (the online-travel-agency feed left zeros blank for part of the year).
- Duplicate bookings from a channel-manager sync: the same booking twice with different booking ids.
- A right-skewed `total`: a few long or suite stays are far above the median, and they are genuine.

## northfield-students.csv — Northfield University student records

Records of 150 students at Northfield University, a fictional university, for the 2025–26 academic year. One row per student; `student_id` should identify each student once.

150 rows, 10 columns. One row per student.

| Column | Meaning | Type | Unit | Valid values |
|---|---|---|---|---|
| `student_id` | Student number | identifier | — | `NU-` followed by four digits; unique |
| `programme` | Degree programme | category | — | Business Administration, Computer Science, Economics, Nursing, Psychology, Mechanical Engineering |
| `year` | Year of study | number (integer, ordered) | — | 1, 2, 3, 4 |
| `gpa` | Grade point average | number | points | 0.00 to 4.00 |
| `credits` | Credits earned so far | number (integer) | credits | 0 to 130 |
| `attendance_pct` | Share of scheduled sessions attended | number | percent | 0 to 100 |
| `study_hours` | Self-reported hours of study per week (survey) | number | hours per week | 0 or more, or blank if the student did not answer |
| `scholarship` | Whether the student holds a scholarship | yes/no | — | yes, no |
| `entry_score` | Score on the entry assessment | number | points | 0 to 100 |
| `residence` | Where the student lives during term | category | — | On campus, Off campus, Family home |

**Problems you will find**

- GPA on two scales: most records use 0–4, transfer records use 0–100 (Northfield converts with GPA = value ÷ 25).
- Attendance above 100%.
- Study hours missing more often in some years of study than others.
- Programme names spelled several ways (case, stray spaces, abbreviations, an acronym and a typing error).
- Right-skewed study hours.
- A few extreme entry scores: some genuine, one a data-entry error.

## For course authors

Each dataset has a manifest (`<name>.manifest.json`) listing every injected defect with its row number, column, original and corrupted value, plus the genuine extreme values. Row numbers count data rows from 1 (the header is not counted). The clean truth used by the tests is in `tests/fixtures-study/`.
