import {describe,expect,it} from 'vitest';
import {photoFrameRatio} from '../src/templates/system/frames';
import {buildTemplateTheme,contrastRatio} from '../src/templates/system/theme';
describe('restored photo and palette intent',()=>{
  it('adapts mixed source orientations but keeps instant prints and film mattes',()=>{
    expect(photoFrameRatio('portrait','landscape')).toBe('3 / 2');
    expect(photoFrameRatio('landscape','portrait')).toBe('4 / 5');
    expect(photoFrameRatio('square','portrait')).toBe('1 / 1');
    expect(photoFrameRatio('cinematic','portrait')).toBe('16 / 9');
    expect(photoFrameRatio('portrait','portrait','4 / 3')).toBe('4 / 3');
  });
  it('preserves darkroom/cinema/nightlife foundations without flattening the light templates',()=>{
    const colors=['#f4f0e7','#181512','#ba3d23','#526150','#f6d6d0'];
    for(const id of ['cinema','after-dark','contact-sheet'] as const){const theme=buildTemplateTheme(colors,id);expect(theme.bg).toBe('#080807');expect(contrastRatio(theme.bg,theme.text)).toBeGreaterThan(4.5);expect(theme.accent).toBe(colors[2]);}
    expect(buildTemplateTheme(colors,'sunday-morning').bg).toBe(colors[0]);
  });
});
