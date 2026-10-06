import { useState } from "react";
import portrait from "../assets/avatar-nick-small.png";
import "./profile-avatar.css";

// Match the home page's link and section-label accents.
const colors = [
  { name: "green", ink: "#00b443" },
  { name: "blue", ink: "#1800ff" },
  { name: "pink", ink: "#e838ff" },
  { name: "red", ink: "#ff3b3b" },
  { name: "sky blue", ink: "#32a5ff" },
];

export default function ProfileAvatar() {
  const [index, setIndex] = useState(0);
  const color = colors[index];

  return <button
    className="profile-avatar"
    type="button"
    aria-label={`Nick Pyl photo: ${color.name}. Click to change fill color`}
    onClick={() => setIndex(current => (current + 1) % colors.length)}
    style={{ "--avatar-ink": color.ink }}
  >
    <img className="profile-avatar-photo" src={portrait} alt="" width="32" height="32" draggable="false" />
  </button>;
}
