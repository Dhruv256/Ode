"use client";
import {createContext} from 'react';
import type {FrameRatio} from './frames';
export const PhotoFrameContext=createContext<FrameRatio | undefined>(undefined);
