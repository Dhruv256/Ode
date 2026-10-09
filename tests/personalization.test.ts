import { describe, expect, it } from 'vitest';
import { MEMORY_QUESTIONS, memoryAnswerOf } from '../src/lib/questions';
import { personalAnswers, recipientQuestion, resolveMemoryKey, MEMORY_FIELDS } from '../src/lib/personalization';
import { HAMPER_ITEM_REGISTRY, hamperFieldLabel } from '../src/features/hamper/config';
import { validateItem } from '../src/features/hamper/validation';

describe('stable recipient question mapping',()=>{
  it.each(MEMORY_QUESTIONS)('$key keeps its schema question and exact answer',q=>{
    const answer='  Funny, caring, dramatic 🥹✨\n“Bro, seriously?”\n  ';
    expect(q.question).toBeTruthy();
    expect(personalAnswers([{key:q.key,answer}])).toEqual([{key:q.key,question:q.recipientQuestion,answer}]);
    expect(recipientQuestion(q.key)).not.toMatch(/undefined|\bthem\b|\btheir\b/);
  });
  it('resolves historical field IDs and renderer aliases without inspecting answers',()=>{
    for(const [alias,key]of Object.entries(MEMORY_FIELDS)){
      expect(resolveMemoryKey(alias)).toBe(key);
      expect(personalAnswers([{id:alias,answer:'Same answer'}])[0].key).toBe(key);
    }
    expect(recipientQuestion('__proto__')).toBeUndefined();
    expect(personalAnswers([{id:'unrecognised',answer:'favorite-song'}])).toEqual([]);
  });
  it('skips empty and skipped optional answers and de-duplicates stable IDs',()=>{
    expect(personalAnswers([{key:'three-words',answer:' ',skipped:false},{key:'three-words',answer:'No',skipped:true},{key:'three-words',answer:'Yes'},{id:'threeWords',answer:'Duplicate'}])).toEqual([{key:'three-words',question:recipientQuestion('three-words'),answer:'Yes'}]);
  });
  it('renders old saved records through the original ID and skips an earlier empty duplicate',()=>{
    const legacy=[{id:'favorite-song',answer:'  Dreams 🎵\nLive version  ',skipped:false}];
    expect(memoryAnswerOf(legacy as Parameters<typeof memoryAnswerOf>[0],'favorite-song')).toBe(legacy[0].answer);
    expect(memoryAnswerOf([{key:'favorite-song',answer:'',skipped:false},{key:'favorite-song',answer:'Second',skipped:false}],'favorite-song')).toBe('Second');
  });
});
describe('hamper personalization',()=>{
  it('uses the editor field IDs for recipient context for every registered item',()=>{
    for(const [type,definition]of Object.entries(HAMPER_ITEM_REGISTRY))for(const field of definition.fields){
      expect(hamperFieldLabel(type as keyof typeof HAMPER_ITEM_REGISTRY,field.key)).toBe(field.recipientLabel);
      expect(field.recipientLabel?.trim()).toBeTruthy();
    }
    expect(hamperFieldLabel('location','note')).toBe('Why this place?');
    expect(hamperFieldLabel('note','unknown')).toBeUndefined();
  });
  it('preserves multiline text, whitespace, punctuation and emojis when saving a keepsake',()=>{
    const body='  A long note… 🥹\n\n“Always!”\n  ';
    const item=validateItem({id:'a0000000-0000-4000-8000-000000000001',type:'note',payload:{title:'  For you ✨  ',body}});
    expect(item.payload).toMatchObject({title:'  For you ✨  ',body});
  });
});
