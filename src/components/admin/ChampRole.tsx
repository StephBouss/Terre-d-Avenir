'use client'

import { SelectField, useField, useForm } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { MODULES, PREREGLAGES } from '@/lib/permissions'

/**
 * Rôle d’un compte : choisir un rôle type pré-remplit les accès par module (toujours modifiables ensuite).
 * « Administrateur principal » n’est proposé que sur le compte qui l’est déjà, et n’y est pas modifiable.
 */
const ChampRole: SelectFieldClientComponent = (props) => {
  const { dispatchFields } = useForm()
  const { value } = useField<string>({ path: props.path })
  const administrateur = value === 'administrateur'
  const options = props.field.options.filter((o) => administrateur || (typeof o === 'object' ? o.value : o) !== 'administrateur')

  return (
    <SelectField
      {...props}
      field={{ ...props.field, options }}
      readOnly={props.readOnly || administrateur}
      onChange={(choix) => {
        const reglage = PREREGLAGES[choix as keyof typeof PREREGLAGES]
        if (!reglage) return
        for (const m of MODULES) dispatchFields({ type: 'UPDATE', path: `acces.${m.cle}`, value: reglage[m.cle] })
      }}
    />
  )
}

export default ChampRole
