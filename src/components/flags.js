import React from "react";

const userFlags = [
  { key: "mod", icon: "👷", title: "Moderator" },
  { key: "ghost", icon: "👻", title: "Ghost" },
  { key: "op", icon: "🅾️", title: "Operator" },
  { key: "trusted", icon: "🤝", title: "Trusted" },
  { key: "muted", icon: "🔇", title: "Muted" },
  { key: "browser", icon: "🌐", title: "Browser" },
];

export function getUserFlags(user) {
  const flags = [];
  for (const { key, icon, title } of userFlags) {
    if (user[key]) {
      flags.push(<span title={title}>{icon}</span>);
    }
  }
  return flags;
}

export function getUserLegend(users) {
  const legend = [];
  for (const { key, icon, title } of userFlags) {
    if (users?.some((u) => u[key])) {
      legend.push(`${icon} ${title}`);
    }
  }
  return legend.join(" | ");
}
