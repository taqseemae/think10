import React from 'react';
import UseAnimations from 'react-useanimations';
import activity from 'react-useanimations/lib/activity';
import calendar from 'react-useanimations/lib/calendar';
import folder from 'react-useanimations/lib/folder';
import help from 'react-useanimations/lib/help';
import settings from 'react-useanimations/lib/settings';
import explore from 'react-useanimations/lib/explore';
import mail from 'react-useanimations/lib/mail';
import userPlus from 'react-useanimations/lib/userPlus';
import copy from 'react-useanimations/lib/copy';
import archive from 'react-useanimations/lib/archive';

export type AnimatedIconName = 
  | 'dashboard' 
  | 'message' 
  | 'users' 
  | 'calendar' 
  | 'clipboard' 
  | 'folder' 
  | 'file' 
  | 'credit' 
  | 'help' 
  | 'settings';

interface Props {
  name: AnimatedIconName;
  size?: number;
  color?: string;
  className?: string;
}

const iconMap = {
  dashboard: explore,
  message: mail,
  users: userPlus,
  calendar: calendar,
  clipboard: copy,
  folder: folder,
  file: archive,
  credit: activity,
  help: help,
  settings: settings,
};

export function AnimatedIcon({ name, size = 20, color = "currentColor", className }: Props) {
  const animation = iconMap[name] || activity;
  
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <UseAnimations
        animation={animation}
        size={size}
        strokeColor={color}
        fillColor={color}
        autoplay={true}
        loop={true}
      />
    </div>
  );
}
