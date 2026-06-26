import { redirect } from "next/navigation";

export default function Home() {
  redirect("/receptionist/login");
}
