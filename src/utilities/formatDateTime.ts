export const formatDateTime = (timestamp: string): string => {
  const now = new Date()
  let date = now
  if (timestamp) date = new Date(timestamp)
  
  const monthsEs = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ]

  const day = date.getDate()
  const month = monthsEs[date.getMonth()]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}
