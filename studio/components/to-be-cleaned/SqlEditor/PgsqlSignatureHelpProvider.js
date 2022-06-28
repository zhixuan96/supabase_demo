import BackwardIterator from './BackwardIterator'

export default function getPgsqlSignatureHelpProvider(monaco, sqlEditorStore) {
  return {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp: function (model, position) {
      // position.column should minus 2 as it returns 2 for first char
      // position.lineNumber should minus 1
      const iterator = new BackwardIterator(model, position.column - 2, position.lineNumber - 1)

      let paramCount = iterator.readArguments()
      if (paramCount < 0) return null

      let ident = iterator.readIdent()
      if (!ident || ident.match(/^\".*?\"$/)) return null

      let fn = sqlEditorStore.functionCache.find(
        (f) => f.name.toLocaleLowerCase() === ident.toLocaleLowerCase()
      )
      if (!fn) return null
      if (!fn.args || fn.args.length < paramCount) return null

      const activeSignature = 0
      const activeParameter = Math.min(paramCount, fn.args.length - 1)
      const signatures = []
      signatures.push({
        label: `${fn.name}( ${fn.args.join(' , ')} )`,
        documentation: fn.description,
        parameters: fn.args.map((v) => {
          return { label: v }
        }),
      })

      return { value: { signatures, activeSignature, activeParameter }, dispose: () => {} }
    },
  }
}
