const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Ejecutando pruebas completas del sistema...\n');

const testFiles = [
  'testing/backend/auth.test.js',
  'testing/backend/users-crud.test.js',
  'testing/backend/products.test.js',
  'testing/backend/orders.test.js',
  'testing/backend/payment.test.js',
  'testing/backend/email.test.js',
  'testing/backend/dashboard.test.js',
  'testing/backend/image-upload.test.js'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

console.log('📋 Archivos de prueba a ejecutar:');
testFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});
console.log('');

for (const testFile of testFiles) {
  try {
    console.log(`\n🔍 Ejecutando: ${testFile}`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    const output = execSync(`npx jest ${testFile} --verbose --no-coverage`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Parsear resultados básicos del output
    const lines = output.split('\n');
    let testCount = 0;
    let passCount = 0;
    let failCount = 0;
    
    lines.forEach(line => {
      if (line.includes('✓')) {
        passCount++;
        testCount++;
      } else if (line.includes('✗') || line.includes('×')) {
        failCount++;
        testCount++;
      }
    });
    
    totalTests += testCount;
    passedTests += passCount;
    failedTests += failCount;
    
    results.push({
      file: testFile,
      status: failCount === 0 ? 'PASS' : 'FAIL',
      tests: testCount,
      passed: passCount,
      failed: failCount,
      duration: `${duration}s`
    });
    
    console.log(`✅ ${testFile} - ${passCount}/${testCount} pruebas pasaron (${duration}s)`);
    
  } catch (error) {
    console.log(`❌ ${testFile} - Error en la ejecución`);
    console.log(error.message);
    
    totalTests += 1;
    failedTests += 1;
    
    results.push({
      file: testFile,
      status: 'ERROR',
      tests: 1,
      passed: 0,
      failed: 1,
      duration: '0s'
    });
  }
}

// Resumen final
console.log('\n' + '='.repeat(80));
console.log('📊 RESUMEN DE PRUEBAS COMPLETAS');
console.log('='.repeat(80));

results.forEach((result, index) => {
  const status = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${status} ${result.file}`);
  console.log(`   Pruebas: ${result.passed}/${result.tests} | Duración: ${result.duration}`);
  if (result.status !== 'PASS') {
    console.log(`   Estado: ${result.status}`);
  }
  console.log('');
});

console.log('📈 ESTADÍSTICAS GENERALES:');
console.log(`   Total de pruebas: ${totalTests}`);
console.log(`   Exitosas: ${passedTests}`);
console.log(`   Fallidas: ${failedTests}`);
console.log(`   Tasa de éxito: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);

if (failedTests === 0) {
  console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
  console.log('✅ El sistema está funcionando correctamente');
} else {
  console.log(`\n⚠️  ${failedTests} prueba(s) fallaron`);
  console.log('🔧 Revisa los errores arriba para más detalles');
}

console.log('\n' + '='.repeat(80));
