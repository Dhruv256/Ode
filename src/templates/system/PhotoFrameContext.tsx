"use client";
import {createContext} from 'react';
import type {FrameRatio} from './frames';
export const PhotoFrameContext=createContext<FrameRatio | undefined>(undefined);

export const CarouselPreloadContext = createContext(false);
export const CarouselColumnsContext = createContext(1);
