interface Issue {
  lineStart:   number
  lineEnd:     number
  severity:    string
  category:    string
  description: string
  fix:         string
}
interface ReviewResult {
  score:   number
  summary: string
  issues:  Issue[]
}
export const parseResponse = (raw: string): ReviewResult=>{
  try{
       const result = JSON.parse(raw)
       return result;
  }
  catch(err){
    throw new Error('Invalid AI response');
  }
}